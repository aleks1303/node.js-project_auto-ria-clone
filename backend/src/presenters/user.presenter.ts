import { config } from "../configs/config";
import { rolePermissions } from "../constants/permissions.constant";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
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
        targetUser: IUser,
        user: IUser,
    ): IUserDetailsResponse {
        const baseResponse = {
            _id: targetUser._id.toString(),
            name: targetUser.name,
            surname: targetUser.surname,
            phone: targetUser.phone,
            avatar: targetUser.avatar
                ? `${config.AWS_S3_ENDPOINT}/${targetUser.avatar}`
                : null,
            region: targetUser.region,
            city: targetUser.city,
        };
        const userPermissions = rolePermissions[user.role as RoleEnum] || [];
        const isOwner = user._id.toString() === targetUser._id.toString();
        const hasAdminAccess = userPermissions.includes(
            PermissionsEnum.USERS_GET_DETAILS,
        );

        if (isOwner || hasAdminAccess) {
            return {
                ...baseResponse,
                email: targetUser.email,
                role: targetUser.role,
                age: targetUser.age,
                accountType: targetUser.accountType,
                permissions: rolePermissions[targetUser.role] || [],
                isBanned: targetUser.isBanned,
                isActive: targetUser.isActive,
                isVerified: targetUser.isVerified,
                isDeleted: targetUser.isDeleted,
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
