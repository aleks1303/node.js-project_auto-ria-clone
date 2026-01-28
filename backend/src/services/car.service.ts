import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { currencyHelper } from "../helpers/currency.helper";
import { moderationHelper } from "../helpers/moderation.helper";
import { ICar, ICarCreateDto } from "../interfaces/car.interface";
import { carRepository } from "../repositories/car.repository";

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
}
export const carService = new CarService();
