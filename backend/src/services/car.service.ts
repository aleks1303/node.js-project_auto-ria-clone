import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";
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
import { carRepository } from "../repositories/car.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";

class CarService {
    public async getAll(query: ICarListQuery, role?: RoleEnum) {
        return await carRepository.getAll(query, role);
    }
    public async create(body: ICarCreateDto, userId: string): Promise<ICar> {
        // 1. Обчислюємо ціни
        const { convertedPrices, exchangeRates } = currencyHelper.convertAll(
            body.price,
            body.currency,
        );
        // 2. Перевіряємо на матюки
        const isClean = !moderationHelper.hasBadWords(body.description);
        const status = isClean ? CarStatusEnum.ACTIVE : CarStatusEnum.PENDING;
        const infoCar = await carRepository.create({
            ...body, // тут тільки brand, model, year, price, currency, description, region
            _userId: userId, // додаємо зверху
            convertedPrices,
            exchangeRates, // додаємо зверху
            status, // додаємо зверху
            editCount: 0, // ініціалізуємо
        });
        // 3. Збираємо фінальний об'єкт для бази (тепер ми впевнені в кожному полі)
        return infoCar.toObject() as ICar;
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
        const updatedCar = await carRepository.update(
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
