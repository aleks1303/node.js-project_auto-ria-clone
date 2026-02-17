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
        const user = await userRepository.getById(userId);
        const isExistBrand = await brandRepository.getByBrandAndModel(
            body.brand,
            body.model,
        );
        if (!isExistBrand) {
            throw new ApiError(
                `Комбінація марки ${body.brand} та моделі ${body.model} не є валідною`,
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        const carsCount = await carRepository.countByUserId(userId);
        if (user.accountType === accountTypeEnum.BASIS && carsCount >= 1) {
            throw new ApiError(
                "Basic аккаунт може створити лише 1 оголошення. Купіть Premium!",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        // 1. Обчислюємо ціни
        const { convertedPrices, exchangeRates } = currencyHelper.convertAll(
            body.price,
            body.currency,
        );
        // 2. Перевіряємо на матюки
        const isClean = !moderationHelper.hasBadWords(body.description);
        const status = isClean ? CarStatusEnum.ACTIVE : CarStatusEnum.PENDING;
        return carRepository.create({
            ...body, // тут тільки brand, model, year, price, currency, description, region
            _userId: userId, // додаємо зверху
            convertedPrices,
            exchangeRates, // додаємо зверху
            status, // додаємо зверху
            editCount: 0,
            views: [], // ініціалізуємо
        });
    }
    public async update(car: ICar, body: ICarUpdateDto): Promise<ICar> {
        let editCount = car.editCount || 0;
        const updateData: Partial<ICar> = { ...body };
        if (body.price || body.currency) {
            const { convertedPrices, exchangeRates } =
                currencyHelper.convertAll(
                    body.price || car.price,
                    body.currency || car.currency,
                );
            // Додаємо ці дані в об'єкт для оновлення
            updateData.convertedPrices = convertedPrices;
            updateData.exchangeRates = exchangeRates;
        }
        let hasBadWords = false;
        if (body.description !== undefined) {
            hasBadWords = moderationHelper.hasBadWords(body.description);

            if (hasBadWords) {
                editCount += 1;
                updateData.editCount = editCount;
                if (editCount >= 3) {
                    updateData.status = CarStatusEnum.INACTIVE;
                } else {
                    updateData.status = CarStatusEnum.PENDING; // або залишаємо як було, якщо хочеш
                }
            } else {
                // Якщо опис чистий — активуємо
                updateData.status = CarStatusEnum.ACTIVE;
            }
        }

        // 2. Єдине оновлення в БД
        const updatedCar = await carRepository.updateById(
            car._id.toString(),
            updateData,
        );

        // 3. Обробка наслідків модерації
        if (hasBadWords) {
            if (editCount >= 3) {
                // Спочатку відправляємо лист (можна не чекати await, якщо налаштована черга)
                await this.findManagerAndSendEmail(updatedCar, editCount);

                throw new ApiError(
                    "Оголошення заблоковано та відправлено менеджеру на перевірку",
                    StatusCodesEnum.FORBIDDEN,
                );
            }

            throw new ApiError(
                `Опис містить нецензурні слова. Залишилось спроб: ${3 - editCount}`,
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
        // 1. Кожен вхід — це новий перегляд

        const car = await carRepository.getById(carId);
        if (!car) {
            throw new ApiError("Авто не знайдено", StatusCodesEnum.NOT_FOUND);
        }
        await carRepository.addView(carId);
        const user = await userRepository.getById(userId);

        let statistics = null;

        // 2. Перевірка на Premium (Пункт 4)
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
        // 1. Шукаємо машину в базі
        const car = await carRepository.getById(carId);

        if (!car) {
            throw new ApiError("Авто не знайдено", StatusCodesEnum.NOT_FOUND);
        }

        // 2. Перевіряємо права
        const isStaff = [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(
            tokenPayload.role as RoleEnum,
        );
        const carOwnerId = String(car._userId?.["_id"] || car._userId);
        const isOwner = carOwnerId === tokenPayload.userId;

        if (!isStaff && !isOwner) {
            throw new ApiError(
                "Ви не можете видалити чуже оголошення",
                StatusCodesEnum.FORBIDDEN,
            );
        }

        // Викликаємо наш новий спеціальний метод
        await carRepository.softDelete(carId);
    }

    public async uploadImage(
        tokenPayload: ITokenPayload,
        carId: string,
        file: UploadedFile,
    ): Promise<ICar> {
        const car = await carRepository.getById(carId);

        // Безпека: перевіряємо, чи цей юзер власник
        if (car._userId.toString() !== tokenPayload.userId) {
            throw new ApiError("You can only edit your own cars", 403);
        }

        const oldFilePath = car.image;
        const image = await s3Service.uploadFile(
            file,
            FileItemTypeEnum.CAR, // додай CAR в свій Enum
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
}
export const carService = new CarService();
