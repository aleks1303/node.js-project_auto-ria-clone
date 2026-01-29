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
    ICarUpdateDto,
} from "../interfaces/car.interface";
import { carRepository } from "../repositories/car.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";

class CarService {
    // car.service.ts
    public async create(body: ICarCreateDto, userId: string): Promise<ICar> {
        // 1. Обчислюємо ціни
        const { convertedPrices } = currencyHelper.convertAll(
            body.price,
            body.currency,
        );
        // 2. Перевіряємо на матюки
        const isClean = !moderationHelper.hasBadWords(body.description);
        const status = isClean ? CarStatusEnum.ACTIVE : CarStatusEnum.PENDING;
        const infoCar = await carRepository.create({
            ...body, // тут тільки brand, model, year, price, currency, description, region
            _userId: userId, // додаємо зверху
            convertedPrices, // додаємо зверху
            status, // додаємо зверху
            editCount: 0, // ініціалізуємо
        });
        // 3. Збираємо фінальний об'єкт для бази (тепер ми впевнені в кожному полі)
        return infoCar.toObject() as ICar;
    }
    public async update(
        carId: string,
        userId: string,
        body: ICarUpdateDto,
    ): Promise<ICar> {
        const car = await carRepository.getById(carId);
        if (!car) {
            throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
        }

        if (car._userId.toString() !== userId) {
            throw new ApiError(
                "You are not the owner of this car",
                StatusCodesEnum.FORBIDDEN,
            );
        }

        let { status, editCount } = car;

        // 1. Модерація (тільки якщо прийшов опис)

        const hasBadWords = moderationHelper.hasBadWords(body.description);

        if (hasBadWords) {
            editCount += 1;
            if (editCount >= 3) {
                status = CarStatusEnum.INACTIVE;
            } else {
                status = CarStatusEnum.PENDING; // або залишаємо як було, якщо хочеш
            }
        } else {
            // Якщо опис чистий — активуємо
            status = CarStatusEnum.ACTIVE;
        }

        // 2. Єдине оновлення в БД
        const updatedCar = await carRepository.update(carId, {
            ...body,
            status,
            editCount,
        });

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

    // public async update(
    //     carId: string,
    //     userId: string,
    //     body: ICarUpdateDto,
    // ): Promise<ICar> {
    //     const car = await carRepository.getById(carId);
    //     if (!car) {
    //         throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
    //     }
    //
    //     if (car._userId.toString() !== userId) {
    //         throw new ApiError("You are not the owner of this car", 403);
    //     }
    //
    //     let status = car.status;
    //     let editCount = car.editCount;
    //
    //     // 👉 МОДЕРАЦІЯ тільки якщо змінюють description
    //     if (body.description !== undefined) {
    //         const isClean = !moderationHelper.hasBadWords(body.description);
    //
    //         if (isClean) {
    //             status = CarStatusEnum.ACTIVE;
    //         } else {
    //             editCount += 1;
    //
    //             if (editCount >= 3) {
    //                 status = CarStatusEnum.INACTIVE;
    //                 const blockedCar = await carRepository.update(carId, {
    //                     ...body, // зберігаємо навіть "поганий" опис, щоб менеджер його бачив
    //                     status,
    //                     editCount,
    //                 });
    //                 await this.findManagerAndSendEmail(blockedCar, editCount);
    //                 throw new ApiError(
    //                     "Оголошення заблоковано через порушення правил модерації",
    //                     StatusCodesEnum.FORBIDDEN,
    //                 ); // 403
    //             } else {
    //                 status = CarStatusEnum.PENDING;
    //                 // зберігаємо лічильник і відбиваємо помилку
    //                 await carRepository.update(carId, {
    //                     ...body,
    //                     status,
    //                     editCount,
    //                 });
    //                 throw new ApiError(
    //                     `Матюки! Спроб залишилось: ${3 - editCount}`,
    //                     StatusCodesEnum.BAD_REQUEST,
    //                 );
    //             }
    //         }
    //     }
    //
    //     // 🔥 ЄДИНИЙ update (і для звичайних полів, і для модерації)
    //     return await carRepository.update(carId, {
    //         ...body,
    //         status,
    //         editCount,
    //     });
    // }

    // public async update(
    //     carId: string,
    //     userId: string,
    //     body: ICarUpdateDto,
    // ): Promise<ICar> {
    //     const car = await carRepository.getById(carId);
    //     if (!car) {
    //         throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
    //     }
    //     if (car._userId.toString() !== userId) {
    //         throw new ApiError("You are not the owner of this car", 403);
    //     }
    //     // if (body.price || body.currency) {
    //     //     const { convertedPrices, exchangeRate } = currencyHelper.convertAll(
    //     //         body.price || car.price,
    //     //         body.currency || car.currency,
    //     //     );
    //     //     // Додаємо ці дані в об'єкт для оновлення
    //     //     body.convertedPrices = convertedPrices;
    //     //     body.exchangeRate = exchangeRate;
    //     // }
    //     let status = car.status;
    //     let editCount = car.editCount;
    //     // const managers = await userRepository.findByRole(UserRoleEnum.MANAGER);
    //
    //     // const emails = managers.map((m) => m.email);
    //     if (body.description) {
    //         const isClean = !moderationHelper.hasBadWords(body.description);
    //         if (isClean) {
    //             status = CarStatusEnum.ACTIVE;
    //         } else {
    //             editCount += 1;
    //             if (editCount >= 3) {
    //                 await carRepository.update(carId, {
    //                     status: CarStatusEnum.INACTIVE,
    //                     editCount,
    //                 });
    //                 await this.findManagerAndSendEmail(car, editCount);
    //             } else {
    //                 status = CarStatusEnum.PENDING;
    //                 // Ми ТАКОЖ маємо зберегти збільшений editCount в базу навіть при помилці
    //                 await carRepository.update(carId, { editCount });
    //                 throw new ApiError(
    //                     `Матюки! Спроб залишилось: ${3 - editCount}`,
    //                     400,
    //                 );
    //             }
    //         }
    //     }
    //     return await carRepository.update(carId, {
    //         ...body,
    //         status,
    //         editCount,
    //     });
    // }

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

// car.service.ts
// public async update(carId: string, body: ICarUpdateDto): Promise<ICar> {
//     const car = await carRepository.findById(carId);
//     if (!car) throw new ApiError("Car not found", 404);
//
// // 1. Перевіряємо на матюки
// const isClean = !moderationHelper.hasBadWords(body.description);
//
// let status = car.status;
// let editCount = car.editCount;
//
// if (isClean) {
//     status = CarStatusEnum.ACTIVE;
// } else {
//     editCount += 1;
//
//     if (editCount >= 3) {
//         status = CarStatusEnum.INACTIVE;
//         // 2. Відправляємо лист менеджеру (EmailService)
//         await emailService.sendModerationAlert(carId, car._userId);
//     } else {
//         status = CarStatusEnum.PENDING;
//         // Тут можна викинути помилку, щоб фронтенд знав: "Виправте матюки, залишилось X спроб"
//         throw new ApiError(`Нецензурна лексика. Залишилось спроб: ${3 - editCount}`, 400);
//     }
// }
//
// const updatedCar = await carRepository.update(carId, {
//     ...body,
//     status,
//     editCount
// });
//
// return updatedCar.toObject() as ICar;
// }
