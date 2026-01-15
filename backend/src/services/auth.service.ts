import { StatusCodesEnum } from "../enums/status-codes.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair, ITokenPayload } from "../interfaces/token.interface";
import {
    ISignInDTO,
    IUser,
    IUserCreateDTO,
} from "../interfaces/user.interface";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
    public async signUp(
        dto: IUserCreateDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        await this.isEmailExist(dto.email);
        const password = await passwordService.hashPassword(dto.password);
        const newUser = await userRepository.create({ ...dto, password });
        const tokens = tokenService.generateTokens({
            userId: newUser._id,
            role: newUser.role,
            accountType: newUser.accountType,
        });
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: newUser._id,
        });

        return { user: newUser, tokens };
    }

    public async signIn(
        dto: ISignInDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        const user = await userRepository.getByEmail(dto.email);
        if (!user) {
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
            accountType: payload.accountType, // Додай всі поля, які є у твоєму інтерфейсі
        };
        const tokens = tokenService.generateTokens(newPayload);
        await tokenRepository.create({
            refreshToken: tokens.refreshToken,
            _userId: payload.userId,
        });

        return tokens;
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
