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
    IUserCreateDTO,
    IUserListQuery,
    IUserWithTokens,
    UpgradeUserDto,
} from "../interfaces/user.interface";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { authService } from "./auth.service";
import { passwordService } from "./password.service";
import { s3Service } from "./s3.service";
import { tokenService } from "./token.service";

class UserService {
    public async getAll(query: IUserListQuery): Promise<[IUser[], number]> {
        return userRepository.getAll(query);
    }

    public async getById(userId: string): Promise<IUser> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
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

    public async deleteById(
        userId: string,
        role: RoleEnum,
        adminId: string,
    ): Promise<void> {
        const user = await userRepository.getById(userId);
        if (!user) {
            new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        if (userId === adminId) {
            throw new ApiError(
                "You cannot delete your own account",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        if (role === RoleEnum.MANAGER) {
            if (
                user.role === RoleEnum.ADMIN ||
                user.role === RoleEnum.MANAGER
            ) {
                throw new ApiError(
                    "A manager cannot remove other managers or admins",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
        }
        await userRepository.updateById(userId, {
            isDeleted: true,
            isActive: false,
        });
        await tokenRepository.deleteManyByParams({ _userId: userId });
    }

    public async userBan(
        userId: string,
        tokenPayload: ITokenPayload,
    ): Promise<Partial<IUser>> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        if (user._id.toString() === tokenPayload.userId) {
            throw new ApiError(
                "You cannot ban yourself.",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        if (user.role === RoleEnum.ADMIN) {
            throw new ApiError(
                "You cannot ban an admin.",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        if (
            user.role === RoleEnum.MANAGER &&
            tokenPayload.role !== RoleEnum.ADMIN
        ) {
            throw new ApiError(
                "A manager cannot ban another manager",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        return userRepository.updateById(userId, { isBanned: true });
    }

    public async createManager(dto: IUserCreateDTO): Promise<IUser> {
        const { email, password, ...rest } = dto;
        await authService.isEmailExist(email);
        await authService.isPhoneExist(dto.phone);
        const hashPassword = await passwordService.hashPassword(password);
        return userRepository.create({
            ...rest,
            email,
            password: hashPassword,
            role: RoleEnum.MANAGER,
            accountType: accountTypeEnum.PREMIUM,
            isVerified: true,
        });
    }

    public async buyPremiumAccount(userId: string): Promise<IUserWithTokens> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        if (user.accountType === accountTypeEnum.PREMIUM) {
            throw new ApiError(
                "User already has a premium account",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        if (
            ![RoleEnum.BUYER, RoleEnum.SELLER].includes(user.role as RoleEnum)
        ) {
            throw new ApiError(
                "This role does not support a premium account.",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        const updateData: Partial<IUser> = {
            accountType: accountTypeEnum.PREMIUM,
        };
        if (user.role === RoleEnum.BUYER) {
            updateData.role = RoleEnum.SELLER;
        }
        const updatedUser = await userRepository.updateById(userId, updateData);
        const tokens = tokenService.generateTokens({
            userId: updatedUser._id,
            role: updatedUser.role,
            accountType: updatedUser.accountType,
        });
        return {
            user: updatedUser,
            tokens: tokens,
        };
    }

    public async changeRoleToSeller(userId: string): Promise<IUserWithTokens> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        if (user.role !== RoleEnum.BUYER) {
            throw new ApiError(
                "You already have the right to sell a car",
                StatusCodesEnum.CONFLICT,
            );
        }
        const updatedUser = await userRepository.updateById(userId, {
            role: RoleEnum.SELLER,
            permissions: rolePermissions[RoleEnum.SELLER],
        });
        const tokens = tokenService.generateTokens({
            userId: updatedUser._id,
            role: updatedUser.role,
            accountType: updatedUser.accountType,
        });

        return { user: updatedUser, tokens };
    }

    public async upgradeUserRole(
        adminId: string,
        userId: string,
        body: UpgradeUserDto,
    ): Promise<IUser> {
        if (adminId === userId) {
            throw new ApiError(
                "Admins cannot change their own role to prevent losing access.",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        const updatedUser = await userRepository.updateById(userId, body);
        if (body.role || body.accountType) {
            await tokenRepository.deleteManyByParams({ _userId: userId });
        }
        return updatedUser;
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
            throw new ApiError(
                "User not have an avatar",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        await s3Service.deleteFile(user.avatar);
        await userRepository.updateById(user._id, { avatar: null });
    }
}
export const userService = new UserService();
