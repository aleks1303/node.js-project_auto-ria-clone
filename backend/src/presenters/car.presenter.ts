import { config } from "../configs/config";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
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
        role?: RoleEnum,
        accountType?: accountTypeEnum,
    ) {
        return {
            data: entities.map((entity) =>
                this.toPublicCarsResDto(entity, role, accountType),
            ),
            total,
            page: query.page,
            pageSize: query.pageSize,
            totalPages: Math.ceil(total / query.pageSize),
        };
    }

    public static toPublicCarsResDto(
        entity: ICar,
        role?: RoleEnum,
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
        const isAdminOrManager = !!(
            role && [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(role)
        );
        const isPremium = accountType === accountTypeEnum.PREMIUM;

        if (isAdminOrManager) {
            response.status = entity.status;
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
        // 2. Якщо в токені accountType === "premium", додаємо поле statistics
        // Поле entity.views вже має бути в моделі ICar у базі
        // if (isPremium || isAdminOrManager) {
        //     return {
        //         ...response,
        //         statistics: {
        //             totalViews: entity.views || 0,
        //             averagePrice: {
        //                 value: averagePrice || 0,
        //                 currency: "UAH",
        //             },
        //         },
        //     };
        // }
        if ((isPremium || isAdminOrManager) && statistics) {
            response.statistics = statistics;
        }
        // 3. Якщо не преміум — повертаємо без статистики
        return response;
    }
}
