import { config } from "../configs/config";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import {
    ICar,
    ICarListQuery,
    ICarPopulated,
    ICarResponse,
    ICarShortResponseDto,
    ICarsResponseDto,
    ICarStatistics,
    IOwnerInfo,
} from "../interfaces/car.interface";

export class CarPresenter {
    public static toCreateResCarDto(car: ICar): ICarResponse {
        return {
            ...this.toShortCarResDto(car),
            _userId: car._userId,
            description: car.description,
            exchangeRates: car.exchangeRates,
            convertedPrices: car.convertedPrices,
            status: car.status,
        };
    }

    public static toShortCarResDto(entity: ICar): ICarShortResponseDto {
        return {
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
            city: entity.city,
            createdAt: entity.createdAt,
        };
    }

    public static toDetailedCarResDto(
        entity: ICarPopulated,
        permissions: PermissionsEnum[] = [],
        accountType?: accountTypeEnum,
        statistics?: ICarStatistics,
    ) {
        const user = entity._userId as unknown as IOwnerInfo;
        const canSeePrivateInfo = permissions.includes(
            PermissionsEnum.CARS_SEE_DETAILS_ALL,
        );
        const canSeeStats = permissions.includes(
            PermissionsEnum.STATS_SEE_PREMIUM,
        );
        const isPremium = accountType === accountTypeEnum.PREMIUM;

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
            city: entity.city,
            description: entity.description,
            createdAt: entity.createdAt,
            owner: {
                name: user.name,
                phone: user.phone,
            },
        };
        // if (user && typeof user === "object") {
        //     response.owner = {
        //         name: user.name,
        //         phone: user.phone,
        //     };
        // }

        if (canSeePrivateInfo) {
            response.status = entity.status;
            response.isDeleted = entity.isDeleted;
            if (entity._userId && typeof entity._userId === "object") {
                response.owner = {
                    _id: user._id,
                    surname: user.surname,
                    ...response.owner,
                    email: user.email,
                };
            }
        }
        if ((isPremium || canSeeStats) && statistics) {
            response.statistics = statistics;
        }
        return response;
    }

    public static toListResDto(
        entities: ICar[],
        total: number,
        query: ICarListQuery,
    ) {
        return {
            data: entities.map((entity) => this.toShortCarResDto(entity)),
            total,
            page: query.page,
            pageSize: query.pageSize,
            totalPages: Math.ceil(total / query.pageSize),
        };
    }
}
