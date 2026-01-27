import { config } from "../configs/config";
import { ICar, ICarResponse } from "../interfaces/car.interface";

export class CarPresenter {
    public static toPublicResCarDto(car: ICar): ICarResponse {
        return {
            _id: car._id,
            _userId: car._userId,
            brand: car.brand,
            model: car.model,
            year: car.year,
            description: car.description,
            price: car.price,
            currency: car.currency,
            convertedPrices: car.convertedPrices,
            region: car.region,
            status: car.status,
            image: car.image ? `${config.AWS_S3_ENDPOINT}/${car.image}` : null,
            createdAt: car.createdAt,
        };
    }

    public static presentMany(cars: ICar[]): ICarResponse[] {
        return cars.map((car) => this.toPublicResCarDto(car));
    }
}
