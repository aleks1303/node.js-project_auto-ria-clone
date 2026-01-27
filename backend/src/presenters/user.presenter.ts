import { config } from "../configs/config";
import {
    IUser,
    IUserListQuery,
    IUserListResponse,
    IUserResponse,
} from "../interfaces/user.interface";

class UserPresenter {
    public toPublicResDto(entity: IUser): IUserResponse {
        return {
            _id: entity._id,
            name: entity.name,
            surname: entity.surname,
            email: entity.email,
            age: entity.age,
            phone: entity.phone,
            role: entity.role,
            permissions: entity.permissions,
            accountType: entity.accountType,
            city: entity.city,
            region: entity.region,
            avatar: entity.avatar
                ? `${config.AWS_S3_ENDPOINT}/${entity.avatar}`
                : null,
            isActive: entity.isActive,
            isVerified: entity.isVerified,
            isDeleted: entity.isDeleted,
        };
    }

    // public toListResDto(
    //     entities: IUser[],
    //     total: number,
    //     query: IUserListQuery,
    // ): IUserListResponse {
    //     return {
    //         // Використовуємо стрілочну функцію, щоб не втратити контекст 'this'
    //         data: entities.map((entity) => this.toPublicResDto(entity)),
    //         total,
    //         ...query,
    //     };
    // }

    // public toListResDto(
    //     entities: IUser[],
    //     total: number,
    //     query: IUserListQuery,
    // ): IUserListResponse {
    //     const totalPages = Math.ceil(total / query.pageSize);
    //
    //     return {
    //         data: entities.map((entity) => this.toPublicResDto(entity)), // Очищаємо паролі
    //         total,
    //         totalPages,
    //         page: query.page,
    //         pageSize: query.pageSize,
    //         prevPage: query.page > 1,
    //         nextPage: query.page < totalPages,
    //     };
    // }

    public toListResDto(
        entities: IUser[],
        total: number,
        query: IUserListQuery,
    ): IUserListResponse {
        return {
            data: entities.map((entity) => this.toPublicResDto(entity)),
            total,
            totalPages: Math.ceil(total / (query.pageSize || 10)),
            query,
        };
    }
}
export const userPresenter = new UserPresenter();

// import { configs } from "../configs/config";
// import {
//     IUser,
//     IUserListQuery,
//     IUserListResponse,
//     IUserResponse,
// } from "../interfaces/user.interface";
//
// class UserPresenter {
//     public toPublicResDto(entity: IUser): IUserResponse {
//         return {
//             _id: entity._id,
//             name: entity.name,
//             email: entity.email,
//             age: entity.age,
//             role: entity.role,
//             avatar: entity.avatar
//                 ? `${configs.AWS_S3_ENDPOINT}/${entity.avatar}`
//                 : null,
//             isDeleted: entity.isDeleted,
//             isVerified: entity.isVerified,
//         };
//     }
//
//     public toListResDto(
//         entities: IUser[],
//         total: number,
//         query: IUserListQuery,
//     ): IUserListResponse {
//         return {
//             data: entities.map(this.toPublicResDto),
//             total,
//             ...query,
//         };
//     }
// }
// export const userPresenter = new UserPresenter();
