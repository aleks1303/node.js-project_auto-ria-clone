import { config } from "../configs/config";
import { rolePermissions } from "../constants/permissions.constant";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import {
    IUser,
    IUserDetailsResponse,
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
            permissions: rolePermissions[entity.role] || [],
            accountType: entity.accountType,
            city: entity.city,
            region: entity.region,
            avatar: entity.avatar
                ? `${config.AWS_S3_ENDPOINT}/${entity.avatar}`
                : null,
            isBanned: entity.isBanned,
            isActive: entity.isActive,
            isVerified: entity.isVerified,
            isDeleted: entity.isDeleted,
        };
    }

    public toDetailsResDto(
        user: IUser,
        tokenPayload?: ITokenPayload,
    ): IUserDetailsResponse {
        const baseResponse = {
            _id: user._id.toString(),
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            avatar: user.avatar
                ? `${config.AWS_S3_ENDPOINT}/${user.avatar}`
                : null,
            region: user.region,
            city: user.city,
        };

        const hasFullAccess =
            tokenPayload?.role === RoleEnum.MANAGER ||
            tokenPayload?.role === RoleEnum.ADMIN ||
            tokenPayload?.userId === user._id.toString();

        if (hasFullAccess) {
            return {
                ...baseResponse,
                email: user.email,
                role: user.role,
                age: user.age,
                accountType: user.accountType,
                permissions: rolePermissions[user.role] || [],
                isBanned: user.isBanned,
                isActive: user.isActive,
                isVerified: user.isVerified,
                isDeleted: user.isDeleted,
            };
        }
        return baseResponse;
    }

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
