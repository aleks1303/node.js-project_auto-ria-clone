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
    ICarUpdateDto,
    IOwnerInfo,
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
        car: ICar,
        body: ICarUpdateDto,
        tokenPayload: ITokenPayload,
    ): Promise<ICar> {
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
        carId: string,
        userId: string,
        userPermissions: PermissionsEnum[],
    ) {
        const car = await carRepository.getById(carId);
        if (!car) {
            throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
        }
        await carRepository.addView(carId);
        const user = await userRepository.getById(userId);

        let statistics = null;

        if (
            user.accountType === accountTypeEnum.PREMIUM ||
            userPermissions.includes(PermissionsEnum.STATS_SEE_PREMIUM)
        ) {
            const now = Date.now();
            const day = 24 * 60 * 60 * 1000;

            const avgPrices = await carRepository.getAveragePrices(
                car.brand,
                car.model,
                car.region,
            );

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
                    region: Math.round(avgPrices.region),
                    ukraine: Math.round(avgPrices.ukraine),
                },
            };
        }

        return { car, statistics };
    }

    public async deleteCar(
        carId: string,
        tokenPayload: ITokenPayload,
    ): Promise<void> {
        const car = await carRepository.getById(carId);

        if (!car) {
            throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
        }

        const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
            tokenPayload.role as RoleEnum,
        );
        const carOwnerId = String(car._userId?.["_id"] || car._userId);
        const isOwner = carOwnerId === tokenPayload.userId;

        if (!isStaff && !isOwner) {
            throw new ApiError(
                "You cannot delete someone else's ad.",
                StatusCodesEnum.FORBIDDEN,
            );
        }

        await carRepository.softDelete(carId);
    }

    public async validate(carId: string): Promise<void> {
        const car = await carRepository.getById(carId);
        if (!car) {
            throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
        }
        await carRepository.updateById(carId, {
            status: CarStatusEnum.ACTIVE,
            editCount: 0,
        });
    }

    public async uploadImage(
        tokenPayload: ITokenPayload,
        carId: string,
        file: UploadedFile,
    ): Promise<ICar> {
        const car = (await carRepository.getById(carId)) as ICar & {
            owner: IOwnerInfo;
        };
        if (!car) {
            throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
        }
        const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
            tokenPayload.role,
        );
        if (car._userId !== tokenPayload.userId && !isStaff) {
            throw new ApiError(
                "You can only edit your own cars",
                StatusCodesEnum.FORBIDDEN,
            );
        }

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
        carId: string,
        tokenPayload: ITokenPayload,
    ): Promise<void> {
        const car = await carRepository.getById(carId);
        if (!car) {
            throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
        }
        if (car._userId !== tokenPayload.userId) {
            throw new ApiError(
                "You can only delete images from your own cars",
                StatusCodesEnum.FORBIDDEN,
            );
        }
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
    // private async getOrThrow(carId: string): Promise<ICarPopulated> {
    //     const car = await carRepository.getById(carId);
    //     if (!car) {
    //         throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
    //     }
    //     return car as ICarPopulated;
    // }
    //
    // // 2. Перевірка доступу
    // private checkAccess(
    //     car: ICarPopulated,
    //     tokenPayload: ITokenPayload,
    //     message: string,
    // ): void {
    //     const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
    //         tokenPayload.role,
    //     );
    //     const isOwner = car.owner._id.toString() === tokenPayload.userId;
    //     if (!isOwner && !isStaff) {
    //         throw new ApiError(message, StatusCodesEnum.FORBIDDEN);
    //     }
    // }

    // private async getCarOrThrow(carId: string): Promise<ICarPopulated> {
    //     const car = await carRepository.getById(carId);
    //     if (!car) {
    //         throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
    //     }
    //     return car as ICarPopulated;
    // }
    //
    // // 2. Перевірка доступу
    // private checkAccess(
    //     car: ICarPopulated,
    //     tokenPayload: ITokenPayload,
    //     message: string,
    // ): void {
    //     const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
    //         tokenPayload.role,
    //     );
    //     const carOwnerId = car.owner?._id ? String(car.owner._id) : null;
    //
    //     const isOwner = carOwnerId === tokenPayload.userId;
    //     if (!isOwner && !isStaff) {
    //         throw new ApiError(message, StatusCodesEnum.FORBIDDEN);
    //     }
    //     console.log("Hello");
    // }
}
export const carService = new CarService();
