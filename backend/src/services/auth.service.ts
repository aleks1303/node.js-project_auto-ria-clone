import { config } from "../configs/config";
import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ActionTokenTypeEnum } from "../enums/user-enum/action-token-type.enum";
import { EmailTypeEnum } from "../enums/user-enum/email-type.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { ApiError } from "../errors/api.error";
import {
    ITokenActionPayload,
    ITokenPair,
    ITokenPayload,
} from "../interfaces/token.interface";
import {
    CheckEmail,
    ForgotPasswordSet,
    ISignInDTO,
    IUser,
    IUserCreateDTO,
} from "../interfaces/user.interface";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { passwordRepository } from "../repositories/password.repository";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
    public async signUp(
        dto: IUserCreateDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        await this.isEmailExist(dto.email);
        const role = dto.role || RoleEnum.BUYER;
        const permissions = rolePermissions[role] || [];
        const checkRole = [RoleEnum.BUYER, RoleEnum.SELLER];
        if (!checkRole.includes(role)) {
            throw new ApiError(
                "You can only register as a Buyer or Seller.",
                StatusCodesEnum.BAD_REQUEST,
            );
        }
        const password = await passwordService.hashPassword(dto.password);
        const newUser = await userRepository.create({
            ...dto,
            role,
            permissions,
            password,
        });
        const tokens = tokenService.generateTokens({
            userId: newUser._id,
            role: newUser.role,
            accountType: newUser.accountType,
        });
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: newUser._id,
        });
        const actionToken = tokenService.generateActionToken(
            { userId: newUser._id },
            ActionTokenTypeEnum.VERIFY_EMAIL,
        );
        await actionTokenRepository.create({
            type: ActionTokenTypeEnum.VERIFY_EMAIL,
            _userId: newUser._id,
            actionToken: actionToken,
        });
        await emailService.sendMail(EmailTypeEnum.WELCOME, newUser.email, {
            name: newUser.name,
            email: newUser.email,
            actionToken: actionToken,
        });

        return { user: newUser, tokens };
    }

    public async signIn(
        dto: ISignInDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        const user = await userRepository.getByEmail(dto.email);
        if (!user || user.isDeleted) {
            throw new ApiError(
                "Invalid email or password",
                StatusCodesEnum.UNAUTHORIZED,
            );
        }
        const isPasswordCorrect = await passwordService.comparePassword(
            dto.password,
            user.password,
        );
        if (!isPasswordCorrect) {
            throw new ApiError(
                "Invalid email or password",
                StatusCodesEnum.UNAUTHORIZED,
            );
        }
        if (user.isBanned) {
            throw new ApiError(
                "Your account is banned. Please contact support.",
                StatusCodesEnum.FORBIDDEN,
            );
        }
        const tokens = tokenService.generateTokens({
            userId: user._id,
            role: user.role,
            accountType: user.accountType,
        });
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: user._id,
        });
        return { user: user, tokens };
    }

    public async refresh(
        refreshToken: string,
        payload: ITokenPayload,
    ): Promise<ITokenPair> {
        await tokenRepository.deleteByParams({ refreshToken });
        const newPayload: ITokenPayload = {
            userId: payload.userId,
            role: payload.role,
            accountType: payload.accountType,
        };
        const tokens = tokenService.generateTokens(newPayload);
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: payload.userId,
        });

        return tokens;
    }

    public async verifyEmail(dto: CheckEmail) {
        const user = await userRepository.getByEmail(dto.email);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        if (user.isVerified) {
            throw new ApiError(
                "Email already verified",
                StatusCodesEnum.CONFLICT,
            );
        }
        await actionTokenRepository.deleteManyByParams({
            _userId: user._id,
            type: ActionTokenTypeEnum.VERIFY_EMAIL,
        });
        const verifyToken = tokenService.generateActionToken(
            { userId: user._id },
            ActionTokenTypeEnum.VERIFY_EMAIL,
        );
        await actionTokenRepository.create({
            type: ActionTokenTypeEnum.VERIFY_EMAIL,
            _userId: user._id,
            actionToken: verifyToken,
        });

        await emailService.sendMail(EmailTypeEnum.WELCOME, user.email, {
            email: user.email,
            name: user.name,
            actionToken: verifyToken,
        });
    }

    public async verifyTokenFromEmail(token: string): Promise<void> {
        const tokenData = await actionTokenRepository.findByParams({
            actionToken: token,
            type: ActionTokenTypeEnum.VERIFY_EMAIL,
        });
        if (!tokenData) {
            throw new ApiError(
                "Token not found or already used",
                StatusCodesEnum.UNAUTHORIZED,
            );
        }
        await userRepository.updateById(tokenData._userId, {
            isVerified: true,
        });
        await actionTokenRepository.deleteManyByParams({ actionToken: token });
    }

    public async forgotPasswordSendEmail(dto: CheckEmail): Promise<void> {
        const user = await userRepository.getByEmail(dto.email);
        if (!user) {
            throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
        }
        const actionToken = tokenService.generateActionToken(
            { userId: user._id },
            ActionTokenTypeEnum.FORGOT_PASSWORD,
        );
        await actionTokenRepository.create({
            type: ActionTokenTypeEnum.FORGOT_PASSWORD,
            _userId: user._id,
            actionToken,
        });
        await emailService.sendMail(EmailTypeEnum.FORGOT_PASSWORD, user.email, {
            name: user.name,
            email: user.email,
            actionToken: actionToken,
        });
    }

    public async forgotPasswordSet(
        dto: ForgotPasswordSet,
        tokenPayload: ITokenActionPayload,
    ) {
        const user = await userRepository.getById(tokenPayload.userId);
        const usedPasswords = await passwordService.isPasswordValid(
            user._id,
            dto.password,
            config.PASSWORD_HISTORY_DAYS,
        );
        if (usedPasswords) {
            throw new ApiError(
                `This password was used in the last ${config.PASSWORD_HISTORY_DAYS} days`,
                StatusCodesEnum.CONFLICT,
            );
        }
        const password = await passwordService.hashPassword(dto.password);
        await passwordRepository.createPassword({
            _userId: user._id,
            password: password,
        });
        await userRepository.updateById(tokenPayload.userId, { password });
        await actionTokenRepository.deleteManyByParams({
            _userId: tokenPayload.userId,
            type: ActionTokenTypeEnum.FORGOT_PASSWORD,
        });
        await tokenRepository.deleteManyByParams({
            _userId: tokenPayload.userId,
        });
    }

    public async logout(userId: string, refreshToken: string): Promise<void> {
        await tokenRepository.deleteByParams({ _userId: userId, refreshToken });
    }

    public async isEmailExist(email: string): Promise<void> {
        const user = await userRepository.getByEmail(email);
        if (user) {
            throw new ApiError(
                "Email is already exist",
                StatusCodesEnum.CONFLICT,
            );
        }
    }
}
export const authService = new AuthService();
