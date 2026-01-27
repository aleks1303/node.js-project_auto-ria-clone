class CarService {
    // car.service.ts
    // public async create(body: ICarCreateDto, userId: string): Promise<ICar> {
    //     // 1. Обчислюємо ціни
    //     const { convertedPrices } = currencyHelper.convertAll(
    //         body.price,
    //         body.currency,
    //     );
    //
    //     // 2. Перевіряємо на матюки
    //     const isClean = !moderationHelper.hasBadWords(body.description);
    //     const status = isClean ? CarStatusEnum.ACTIVE : CarStatusEnum.PENDING;
    //
    //     // 3. Збираємо фінальний об'єкт для бази (тепер ми впевнені в кожному полі)
    //     return await carRepository.create({
    //         ...body, // тут тільки brand, model, year, price, currency, description, region
    //         _userId: userId, // додаємо зверху
    //         convertedPrices, // додаємо зверху
    //         status, // додаємо зверху
    //         editCount: 0, // ініціалізуємо
    //     });
    // }
}
export const carService = new CarService();
