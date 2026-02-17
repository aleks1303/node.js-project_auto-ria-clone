import { UploadedFile } from "express-fileupload";

import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { FileItemTypeEnum } from "../enums/user-enum/file-item-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import {
    IUser,
    IUserListQuery,
    IUserWithTokens,
} from "../interfaces/user.interface";
import { userRepository } from "../repositories/user.repository";
import { s3Service } from "./s3.service";
import { tokenService } from "./token.service";

class UserService {
    public async getAll(query: IUserListQuery): Promise<[IUser[], number]> {
        return userRepository.getAll(query);
    }

    public async getById(userId: string): Promise<IUser> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        return user;
    }

    public async updateMe(
        userId: string,
        user: Partial<IUser>,
    ): Promise<IUser> {
        const data = await userRepository.getById(userId);
        if (!data) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        return userRepository.updateById(userId, user);
    }

    public async buyPremiumAccount(userId: string): Promise<IUserWithTokens> {
        const user = await userRepository.getById(userId);
        if (user.accountType === accountTypeEnum.PREMIUM) {
            throw new ApiError(
                "User already has a premium account",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        if (
            ![RoleEnum.BUYER, RoleEnum.SELLER].includes(user.role as RoleEnum)
        ) {
            throw new ApiError("Ця роль не підтримує преміум-акаунт", 403);
        }

        const updateData: Partial<IUser> = {
            accountType: accountTypeEnum.PREMIUM,
        };

        // Якщо це був Покупець, він стає Продавцем з правами
        if (user.role === RoleEnum.BUYER) {
            updateData.role = RoleEnum.SELLER;
        }

        const updatedUser = await userRepository.updateById(userId, updateData);
        const tokens = tokenService.generateTokens({
            userId: updatedUser._id,
            role: updatedUser.role,
            accountType: updatedUser.accountType,
        });

        // Повертаємо об'єкт, який містить все необхідне
        return {
            user: updatedUser,
            tokens: tokens,
        };
    }

    public async changeRoleToSeller(userId: string): Promise<IUserWithTokens> {
        const user = await userRepository.getById(userId);

        // Якщо він уже продавець або вище - нічого не робимо
        if (user.role !== RoleEnum.BUYER) {
            throw new ApiError("Ви вже маєте право продавати авто", 400);
        }

        const updatedUser = await userRepository.updateById(userId, {
            role: RoleEnum.SELLER,
            permissions: rolePermissions[RoleEnum.SELLER],
        });

        // Обов'язково генеруємо НОВІ токени, щоб у Postman з'явилися права SELLER
        const tokens = tokenService.generateTokens({
            userId: updatedUser._id,
            role: updatedUser.role,
            accountType: updatedUser.accountType,
        });

        return { user: updatedUser, tokens };
    }

    public async uploadAvatar(
        tokenPayload: ITokenPayload,
        file: UploadedFile,
    ): Promise<IUser> {
        const user = await userRepository.getById(tokenPayload.userId);
        const oldFilePath = user.avatar;
        const avatar = await s3Service.uploadFile(
            file,
            FileItemTypeEnum.USER,
            user._id,
            oldFilePath,
        );

        return userRepository.updateById(user._id, { avatar });
    }

    public async deleteAvatar(jwtPayload: ITokenPayload): Promise<void> {
        const user = await userRepository.getById(jwtPayload.userId);
        if (!user.avatar) {
            throw new ApiError("User not have an avatar", 400);
        }
        await s3Service.deleteFile(user.avatar);
        await userRepository.updateById(user._id, { avatar: null });
    }

    // private getPermissionsByRole(role: RoleEnum): PermissionsEnum[] {
    //     return rolePermissions[role] || [];
    // }
}
export const userService = new UserService();
