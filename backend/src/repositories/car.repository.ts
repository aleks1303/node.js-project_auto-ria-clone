import { HydratedDocument } from "mongoose";

import { ICar, ICarCreateDb } from "../interfaces/car.interface";
import { Car } from "../models/car.model";

class CarRepository {
    public async create(car: ICarCreateDb): Promise<HydratedDocument<ICar>> {
        const createdCar = await Car.create(car);
        return createdCar as unknown as HydratedDocument<ICar>;
    }
}
export const carRepository = new CarRepository();
