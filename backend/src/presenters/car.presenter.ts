import { config } from "../configs/config";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { ICar, ICarListQuery, ICarResponse } from "../interfaces/car.interface";
import { ITokenPayload } from "../interfaces/token.interface";

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
            city: car.city,
            status: car.status,
            image: car.image ? `${config.AWS_S3_ENDPOINT}/${car.image}` : null,
            createdAt: car.createdAt,
        };
    }

    public static presentMany(cars: ICar[]): ICarResponse[] {
        return cars.map((car) => this.toPublicResCarDto(car));
    }

    public static toListResDto(
        entities: ICar[],
        total: number,
        query: ICarListQuery,
        tokenPayload?: ITokenPayload,
    ) {
        return {
            data: entities.map((entity) =>
                this.toPublicResDto(entity, tokenPayload),
            ),
            total,
            page: query.page,
            pageSize: query.pageSize,
            totalPages: Math.ceil(total / query.pageSize),
        };
    }

    public static toPublicResDto(entity: ICar, tokenPayload?: ITokenPayload) {
        // 1. Створюємо базовий об'єкт (публічний)
        const response = {
            _id: entity._id,
            brand: entity.brand,
            model: entity.model,
            price: entity.price,
            currency: entity.currency,
            year: entity.year,
            region: entity.region,
            description: entity.description,
            status: entity.status,
            createdAt: entity.createdAt,
        };

        // 2. Якщо в токені accountType === "premium", додаємо поле statistics
        // Поле entity.views вже має бути в моделі ICar у базі
        if (tokenPayload?.accountType === accountTypeEnum.PREMIUM) {
            return {
                ...response,
                statistics: {
                    totalViews: entity.views,
                },
            };
        }

        // 3. Якщо не преміум — повертаємо без статистики
        return response;
    }
}
