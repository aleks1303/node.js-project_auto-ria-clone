import { config } from "../configs/config";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import {
    ICar,
    ICarListQuery,
    ICarResponse,
    ICarsResponseDto,
    ICarStatistics,
    IOwnerInfo,
} from "../interfaces/car.interface";

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
            exchangeRates: car.exchangeRates,
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
        permissions: PermissionsEnum[] = [],
        accountType?: accountTypeEnum,
    ) {
        return {
            data: entities.map((entity) =>
                this.toPublicCarsResDto(entity, permissions, accountType),
            ),
            total,
            page: query.page,
            pageSize: query.pageSize,
            totalPages: Math.ceil(total / query.pageSize),
        };
    }

    public static toPublicCarsResDto(
        entity: ICar,
        permissions: PermissionsEnum[] = [],
        accountType?: accountTypeEnum,
        statistics?: ICarStatistics,
    ) {
        // 1. Створюємо базовий об'єкт (публічний)
        const response: ICarsResponseDto = {
            _id: entity._id,
            brand: entity.brand,
            model: entity.model,
            image: entity.image
                ? `${config.AWS_S3_ENDPOINT}/${entity.image}`
                : null,
            price: entity.price,
            currency: entity.currency,
            year: entity.year,
            region: entity.region,
            description: entity.description,
            createdAt: entity.createdAt,
        };
        const canSeePrivateInfo = permissions.includes(
            PermissionsEnum.CARS_SEE_DETAILS_ALL,
        );
        const canSeeStats = permissions.includes(
            PermissionsEnum.STATS_SEE_PREMIUM,
        );
        const isPremium = accountType === accountTypeEnum.PREMIUM;

        if (canSeePrivateInfo) {
            response.status = entity.status;
            response.isDeleted = entity.isDeleted;
            if (entity._userId && typeof entity._userId === "object") {
                const user = entity._userId as unknown as IOwnerInfo; // Тут 'any' допустимо лише для приведення типу після populate
                response.owner = {
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                };
            }
        }

        if ((isPremium || canSeeStats) && statistics) {
            response.statistics = statistics;
        }
        // 3. Якщо не преміум — повертаємо без статистики
        return response;
    }
}
