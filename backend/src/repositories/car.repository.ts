import { FilterQuery, HydratedDocument } from "mongoose";

import { CarStatusEnum } from "../enums/car-enum/car-status.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
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
        role?: RoleEnum,
    ): Promise<[ICar[], number]> {
        const skip = (query.page - 1) * query.pageSize;
        const ADMIN_ROLES = [RoleEnum.ADMIN, RoleEnum.MANAGER];
        // Створюємо базовий фільтр
        const filter: FilterQuery<ICar> = {};
        const sortField =
            query.orderBy === "price" ? "convertedPrices.UAH" : query.orderBy;
        // Якщо це НЕ адмін і НЕ менеджер — показуємо тільки активні
        if (!role || !ADMIN_ROLES.includes(role)) {
            filter.status = CarStatusEnum.ACTIVE;
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
            filter.price = {};
            if (query.priceMin) filter.price.$gte = query.priceMin;
            if (query.priceMax) filter.price.$lte = query.priceMax;
        }

        // Виконуємо пошук та підрахунок одночасно
        const [entities, total] = await Promise.all([
            Car.find(filter)
                .populate("_userId", "name surname email role")
                .skip(skip)
                .limit(query.pageSize)
                .sort({ [sortField]: query.order === "asc" ? 1 : -1 }),
            // Нові оголошення зверху
            Car.countDocuments(filter),
        ]);

        return [entities, total];
    }

    public async create(car: ICarCreateDb): Promise<HydratedDocument<ICar>> {
        const createdCar = await Car.create(car);
        return createdCar as unknown as HydratedDocument<ICar>;
    }

    public update(carId: string, car: ICarUpdateDb): Promise<ICar> {
        return Car.findByIdAndUpdate(carId, car, { new: true });
    }

    public getById(carId: string): Promise<ICar> {
        return Car.findById(carId);
    }
}
export const carRepository = new CarRepository();
