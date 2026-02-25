import { UploadedFile } from "express-fileupload";

import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";
import { FileItemTypeEnum } from "../enums/user-enum/file-item-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ApiError } from "../errors/api.error";
import { currencyHelper } from "../helpers/currency.helper";
import { moderationHelper } from "../helpers/moderation.helper";
import {
    ICar,
    ICarCreateDto,
    ICarListQuery,
    ICarPopulated,
    ICarUpdateDto,
} from "../interfaces/car.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { brandRepository } from "../repositories/brand.repository";
import { carRepository } from "../repositories/car.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { s3Service } from "./s3.service";

class CarService {
    public async getAll(
        query: ICarListQuery,
        permissions: PermissionsEnum[] = [],
    ) {
        return carRepository.getAll(query, permissions);
    }
    public async create(body: ICarCreateDto, userId: string): Promise<ICar> {
        const isExistBrand = await brandRepository.getByBrandAndModel(
            body.brand,
            body.model,
        );
        if (!isExistBrand) {
            throw new ApiError(
                `Brand combination ${body.brand} and model ${body.model} is not valid`,
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        const { convertedPrices, exchangeRates } = currencyHelper.convertAll(
            body.price,
            body.currency,
        );
        const isClean = !moderationHelper.hasBadWords(body.description);
        const status = isClean ? CarStatusEnum.ACTIVE : CarStatusEnum.PENDING;
        return carRepository.create({
            ...body,
            _userId: userId,
            convertedPrices,
            exchangeRates,
            status,
            editCount: 0,
            views: [],
        });
    }
    public async update(
        car: ICarPopulated,
        body: ICarUpdateDto,
        tokenPayload: ITokenPayload,
    ): Promise<ICar> {
        this.checkAccess(
            car,
            tokenPayload,
            "Access denied. You can only edit your own cars.",
        );
        let editCount = car.editCount || 0;
        const updateData: Partial<ICar> = { ...body };
        const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
            tokenPayload.role,
        );
        if (body.price || body.currency) {
            const { convertedPrices, exchangeRates } =
                currencyHelper.convertAll(
                    body.price || car.price,
                    body.currency || car.currency,
                );
            updateData.convertedPrices = convertedPrices;
            updateData.exchangeRates = exchangeRates;
        }
        let hasBadWords = false;
        if (body.description !== undefined) {
            hasBadWords = moderationHelper.hasBadWords(body.description);
            if (isStaff) {
                updateData.status = CarStatusEnum.ACTIVE;
                updateData.editCount = 0;
            } else if (hasBadWords) {
                editCount += 1;
                updateData.editCount = editCount;
                if (editCount >= 3) {
                    updateData.status = CarStatusEnum.INACTIVE;
                } else {
                    updateData.status = CarStatusEnum.PENDING;
                }
            } else {
                updateData.status = CarStatusEnum.ACTIVE;
            }
        }

        const updatedCar = await carRepository.updateById(
            car._id.toString(),
            updateData,
        );

        if (hasBadWords && !isStaff) {
            if (editCount >= 3) {
                await this.findManagerAndSendEmail(updatedCar, editCount);
                throw new ApiError(
                    "The ad has been blocked and sent to the manager for review.",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
            throw new ApiError(
                `The description contains obscene language. Attempts remaining: ${3 - editCount}`,
                StatusCodesEnum.BAD_REQUEST,
            );
        }

        return updatedCar;
    }
    public async getById(
        car: ICarPopulated,
        accountType: string,
        userPermissions: PermissionsEnum[],
    ) {
        await carRepository.addView(car._id.toString());
        let statistics = null;
        if (
            accountType === accountTypeEnum.PREMIUM ||
            userPermissions.includes(PermissionsEnum.STATS_SEE_PREMIUM)
        ) {
            const now = Date.now();
            const day = 24 * 60 * 60 * 1000;
            const avgPrices = await carRepository.getAveragePrices(
                car.brand,
                car.model,
                car.region,
            );
            const currentRate = car.price / (car.convertedPrices?.USD || 1);
            statistics = {
                views: {
                    day: car.views.filter((v) => now - v.getTime() < day)
                        .length,
                    week: car.views.filter((v) => now - v.getTime() < day * 7)
                        .length,
                    month: car.views.filter((v) => now - v.getTime() < day * 30)
                        .length,
                    total: car.views.length,
                },
                averagePrice: {
                    region: Math.round(avgPrices.region * currentRate),
                    ukraine: Math.round(avgPrices.ukraine * currentRate),
                    currency: car.currency,
                },
            };
        }
        return { car, statistics };
    }

    public async deleteCar(
        car: ICarPopulated,
        tokenPayload: ITokenPayload,
    ): Promise<void> {
        this.checkAccess(
            car,
            tokenPayload,
            "Forbidden. You do not have permission to delete this car.",
        );

        await carRepository.softDelete(car._id.toString());
    }

    public async validate(carId: string): Promise<void> {
        await carRepository.updateById(carId, {
            status: CarStatusEnum.ACTIVE,
            editCount: 0,
        });
    }

    public async uploadImage(
        tokenPayload: ITokenPayload,
        car: ICarPopulated,
        file: UploadedFile,
    ): Promise<ICar> {
        this.checkAccess(
            car,
            tokenPayload,
            "Access denied. You cannot upload images to this car.",
        );
        const oldFilePath = car.image;
        const image = await s3Service.uploadFile(
            file,
            FileItemTypeEnum.CAR,
            car._id.toString(),
            oldFilePath,
        );

        return carRepository.updateById(car._id.toString(), { image });
    }

    public async deleteImage(
        car: ICarPopulated,
        tokenPayload: ITokenPayload,
    ): Promise<void> {
        this.checkAccess(
            car,
            tokenPayload,
            "Access denied. You cannot delete this car's image.",
        );
        if (!car.image) {
            throw new ApiError(
                "Car does not have an image",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        await s3Service.deleteFile(car.image);
        await carRepository.updateById(car._id.toString(), { image: null });
    }

    private async findManagerAndSendEmail(car: ICar, editCount: number) {
        const managers = await userRepository.findByRole(RoleEnum.MANAGER);

        const emails = managers.map((m) => m.email);
        if (!emails.length) return;
        await emailService.sendMail(
            EmailTypeEnum.BLOCKED_CAR,
            emails.join(","),
            {
                car,
                editCount,
            },
        );
    }

    private checkAccess(
        car: ICarPopulated,
        tokenPayload: ITokenPayload,
        message: string,
    ): void {
        const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
            tokenPayload.role,
        );
        const isOwner = car._userId._id.toString() === tokenPayload.userId;
        if (!isOwner && !isStaff) {
            throw new ApiError(message, StatusCodesEnum.FORBIDDEN);
        }
    }
}
export const carService = new CarService();
