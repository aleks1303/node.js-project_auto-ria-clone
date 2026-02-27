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
        const filter: FilterQuery<ICar> = {};
        const canSeeAllStatuses = permissions.includes(
            PermissionsEnum.CARS_SEE_DETAILS_ALL,
        );
        const sortField =
            query.orderBy === "price" ? "convertedPrices.UAH" : query.orderBy;
        if (canSeeAllStatuses) {
            filter.isDeleted = query.isDeleted === true;
            if (query.status) {
                filter.status = query.status;
            }
        } else {
            filter.isDeleted = false;
            filter.status = CarStatusEnum.ACTIVE;
        }
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

        const [entities, total] = await Promise.all([
            Car.find(filter)
                .skip(skip)
                .limit(query.pageSize)
                .sort({ [sortField]: query.order === "asc" ? 1 : -1 })
                .lean(),
            Car.countDocuments(filter),
        ]);

        return [entities as unknown as ICar[], total];
    }

    public async create(car: ICarCreateDb): Promise<ICar> {
        const createdCar = await Car.create(car);
        return createdCar.toObject({}) as unknown as ICar;
    }

    public updateById(carId: string, car: ICarUpdateDb): Promise<ICar> {
        return Car.findByIdAndUpdate(carId, car, {
            new: true,
        });
    }

    public getById(carId: string): Promise<ICar | null> {
        return Car.findOne({ _id: carId, isDeleted: false })
            .populate("_userId", "name phone email surname")
            .lean() as unknown as Promise<ICar>;
    }

    public async softDelete(carId: string): Promise<void> {
        await Car.updateOne(
            { _id: carId },
            {
                $set: {
                    isDeleted: true,
                    status: CarStatusEnum.INACTIVE,
                    updatedAt: new Date(),
                },
            },
        );
    }

    public async updateManyByParams(
        filter: FilterQuery<ICar>,
        update: Partial<ICar>,
    ): Promise<void> {
        await Car.updateMany(filter, { $set: update });
    }

    public async countByUserId(userId: string): Promise<number> {
        return Car.countDocuments({
            _userId: userId,
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
            {
                $match: {
                    brand,
                    model,
                    status: CarStatusEnum.ACTIVE,
                    isDeleted: false,
                },
            },
            {
                $facet: {
                    ukraine: [
                        {
                            $group: {
                                _id: null,
                                avg: { $avg: "$convertedPrices.USD" },
                            },
                        },
                    ],
                    region: [
                        { $match: { region } },
                        {
                            $group: {
                                _id: null,
                                avg: { $avg: "$convertedPrices.USD" },
                            },
                        },
                    ],
                },
            },
        ]);

        return {
            ukraine: stats[0].ukraine[0]?.avg || 0,
            region: stats[0].region[0]?.avg || 0,
        };
    }
}
export const carRepository = new CarRepository();
