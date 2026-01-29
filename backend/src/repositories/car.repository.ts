import { HydratedDocument } from "mongoose";

import { ICar, ICarCreateDb, ICarUpdateDb } from "../interfaces/car.interface";
import { Car } from "../models/car.model";

class CarRepository {
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
