import { UploadedFile } from "express-fileupload";

import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { FileItemTypeEnum } from "../enums/user-enum/file-item-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ApiError } from "../errors/api.error";
import {
    IManagerCreateDTO,
    IUser,
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

    public async updateMe(user: IUser, dto: Partial<IUser>): Promise<IUser> {
        return userRepository.updateById(user._id, dto);
    }

    public async buyPremiumAccount(user: IUser): Promise<IUserWithTokens> {
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
        const updatedUser = await userRepository.updateById(
            user._id,
            updateData,
        );
        const tokens = tokenService.generateTokens({
            userId: updatedUser._id,
            role: updatedUser.role,
            accountType: updatedUser.accountType,
        });
        await tokenRepository.deleteManyByParams({ _userId: user._id });
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: user._id,
        });
        return {
            user: updatedUser,
            tokens: tokens,
        };
    }

    public async changeRoleToSeller(user: IUser): Promise<IUserWithTokens> {
        if (user.role !== RoleEnum.BUYER) {
            throw new ApiError(
                "You already have the right to sell a car",
                StatusCodesEnum.CONFLICT,
            );
        }
        const updatedUser = await userRepository.updateById(user._id, {
            role: RoleEnum.SELLER,
            permissions: rolePermissions[RoleEnum.SELLER],
        });
        const tokens = tokenService.generateTokens({
            userId: updatedUser._id,
            role: updatedUser.role,
            accountType: updatedUser.accountType,
        });
        await tokenRepository.deleteManyByParams({ _userId: user._id });
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: user._id,
        });

        return { user: updatedUser, tokens };
    }

    public async uploadAvatar(user: IUser, file: UploadedFile): Promise<IUser> {
        const oldFilePath = user.avatar;
        const avatar = await s3Service.uploadFile(
            file,
            FileItemTypeEnum.USER,
            user._id,
            oldFilePath,
        );

        return userRepository.updateById(user._id, { avatar });
    }

    public async deleteAvatar(user: IUser): Promise<void> {
        if (!user.avatar) {
            throw new ApiError(
                "User not have an avatar",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        await s3Service.deleteFile(user.avatar);
        await userRepository.updateById(user._id, { avatar: null });
    }

    public async createManager(dto: IManagerCreateDTO): Promise<IUser> {
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

    public async upgradeUserRole(
        adminUser: IUser,
        targetUser: IUser,
        body: UpgradeUserDto,
    ): Promise<IUser> {
        if (adminUser._id.toString() === targetUser._id.toString()) {
            throw new ApiError(
                "Admins cannot change their own role to prevent losing access.",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        const updatedUser = await userRepository.updateById(
            targetUser._id,
            body,
        );
        if (body.role || body.accountType) {
            await tokenRepository.deleteManyByParams({
                _userId: targetUser._id,
            });
        }
        return updatedUser;
    }

    public async userBan(targetUser: IUser, adminUser: IUser): Promise<void> {
        this.checkModerationRights(targetUser, adminUser, "ban");
        await userRepository.updateById(targetUser._id, { isBanned: true });
        await tokenRepository.deleteManyByParams({ _userId: targetUser._id });
    }

    public async userUnBan(targetUser: IUser, adminUser: IUser): Promise<void> {
        this.checkModerationRights(targetUser, adminUser, "unban");
        await userRepository.updateById(targetUser._id, { isBanned: false });
    }

    public async deleteById(
        targetUser: IUser,
        adminUser: IUser,
    ): Promise<void> {
        const userPermissions = rolePermissions[adminUser.role] || [];
        if (targetUser._id.toString() === adminUser._id.toString()) {
            throw new ApiError(
                "You cannot delete your own account",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        if (!userPermissions.includes(PermissionsEnum.USERS_DELETE)) {
            throw new ApiError(
                "No permission to delete users",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        if (adminUser.role === RoleEnum.MANAGER) {
            if ([RoleEnum.ADMIN, RoleEnum.MANAGER].includes(targetUser.role)) {
                throw new ApiError(
                    "A manager cannot remove other staff members (Managers/Admins)",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
        }
        await userRepository.updateById(targetUser._id, {
            isDeleted: true,
            isActive: false,
        });
        await tokenRepository.deleteManyByParams({ _userId: targetUser._id });
    }

    private checkModerationRights(
        targetUser: IUser,
        adminUser: IUser,
        action: "ban" | "unban",
    ): void {
        const userPermissions = rolePermissions[adminUser.role] || [];
        if (targetUser._id.toString() === adminUser._id.toString()) {
            throw new ApiError(
                `You cannot ${action} yourself.`,
                StatusCodesEnum.FORBIDDEN,
            );
        }
        if (!userPermissions.includes(PermissionsEnum.USERS_BAN)) {
            throw new ApiError(
                `No permission to ${action} users`,
                StatusCodesEnum.FORBIDDEN,
            );
        }
        if (targetUser.role === RoleEnum.ADMIN) {
            throw new ApiError(
                `You cannot ${action} an admin.`,
                StatusCodesEnum.FORBIDDEN,
            );
        }
        if (
            targetUser.role === RoleEnum.MANAGER &&
            adminUser.role !== RoleEnum.ADMIN
        ) {
            throw new ApiError(
                `A manager cannot ${action} another manager.`,
                StatusCodesEnum.FORBIDDEN,
            );
        }
    }
}
export const userService = new UserService();
