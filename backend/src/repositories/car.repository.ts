import { FilterQuery } from "mongoose";

import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import {
    ICar,
    ICarCreateDb,
    ICarListQuery,
    ICarUpdateDb,
} from "../interfaces/car.interface";
import { Car } from "../models/car.model";

class CarRepository {
    public async getAll(
        query: ICarListQuery,
        permissions: PermissionsEnum[] = [],
    ): Promise<[ICar[], number]> {
        const skip = (query.page - 1) * query.pageSize;
        // Створюємо базовий фільтр
        const filter: FilterQuery<ICar> = { isDeleted: false };
        const canSeeAllStatuses = permissions.includes(
            PermissionsEnum.CARS_SEE_DETAILS_ALL,
        );
        const sortField =
            query.orderBy === "price" ? "convertedPrices.UAH" : query.orderBy;
        // Якщо це НЕ адмін і НЕ менеджер — показуємо тільки активні
        if (!canSeeAllStatuses) {
            // Звичайний юзер бачить ТІЛЬКИ активні
            filter.status = CarStatusEnum.ACTIVE;
        } else {
            delete filter.isDeleted;
        }
        // Додаємо всі фільтри з query, якщо вони існують
        if (query.brand) {
            filter.brand = query.brand;
        }
        if (query.model) {
            filter.model = query.model;
        }
        if (query.region) {
            filter.region = query.region;
        }
        if (query.priceMin || query.priceMax) {
            filter["convertedPrices.UAH"] = {};
            if (query.priceMin)
                filter["convertedPrices.UAH"].$gte = query.priceMin;
            if (query.priceMax)
                filter["convertedPrices.UAH"].$lte = query.priceMax;
        }

        // Виконуємо пошук та підрахунок одночасно
        const [entities, total] = await Promise.all([
            Car.find(filter)
                .populate("_userId", "name surname email role")
                .skip(skip)
                .limit(query.pageSize)
                .sort({ [sortField]: query.order === "asc" ? 1 : -1 })
                .lean(),
            // Нові оголошення зверху
            Car.countDocuments(filter),
        ]);

        return [entities as unknown as ICar[], total];
    }

    public async create(car: ICarCreateDb): Promise<ICar> {
        const createdCar = await Car.create(car);
        return createdCar.toObject({}) as unknown as ICar;
    }

    public updateById(carId: string, car: ICarUpdateDb): Promise<ICar> {
        return Car.findByIdAndUpdate(carId, car, { new: true });
    }

    public getById(carId: string): Promise<ICar> {
        return Car.findById(carId)
            .populate("_userId")
            .lean() as unknown as Promise<ICar>;
    }

    public async countByUserId(userId: string): Promise<number> {
        // countDocuments — це вбудований метод Mongoose, який дуже швидко рахує записи
        return Car.countDocuments({
            _userId: userId,
            // status: CarStatusEnum.ACTIVE, // Рахуємо тільки ті, що зараз у продажу
            isDeleted: false,
        });
    }

    public async addView(carId: string): Promise<void> {
        await Car.findByIdAndUpdate(carId, { $push: { views: new Date() } });
    }

    public async getAveragePrices(
        brand: string,
        model: string,
        region: string,
    ) {
        const stats = await Car.aggregate([
            { $match: { brand, model, status: "active" } },
            {
                $facet: {
                    ukraine: [
                        { $group: { _id: null, avg: { $avg: "$price" } } },
                    ],
                    region: [
                        { $match: { region } },
                        { $group: { _id: null, avg: { $avg: "$price" } } },
                    ],
                },
            },
        ]);

        return {
            ukraine: stats[0].ukraine[0]?.avg || 0,
            region: stats[0].region[0]?.avg || 0,
        };
    }
    // public async getAveragePrice(
    //     brand: string,
    //     model: string,
    // ): Promise<number> {
    //     const result = await Car.aggregate([
    //         {
    //             $match: {
    //                 brand: brand,
    //                 model: model,
    //                 status: CarStatusEnum.ACTIVE, // Рахуємо тільки по актуальних авто
    //             },
    //         },
    //         {
    //             $group: {
    //                 _id: null, // Нам не потрібне групування за полем, ми хочемо одне число
    //                 averagePrice: { $avg: "$convertedPrices.UAH" }, // Рахуємо середнє в гривні
    //             },
    //         },
    //     ]);
    //
    //     // Якщо база пуста — повертаємо 0, інакше округлюємо результат
    //     return result.length > 0 ? Math.round(result[0].averagePrice) : 0;
    // }
}
export const carRepository = new CarRepository();
