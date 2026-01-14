import { StatusCodesEnum } from "../enums/status-codes.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair } from "../interfaces/token.interface";
import { IUser, IUserCreateDTO } from "../interfaces/user.interface";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
    public async signUp(
        user: IUserCreateDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        await this.isEmailExist(user.email);
        const password = await passwordService.hashPassword(user.password);
        const newUser = await userRepository.create({ ...user, password });
        const tokens = tokenService.generateTokens({
            userId: newUser._id,
            role: newUser.role,
            accountType: newUser.accountType,
        });
        await tokenRepository.create({ ...tokens, _userId: newUser._id });

        return { user: newUser, tokens };
    }

    public async isEmailExist(email: string): Promise<void> {
        const user = await userRepository.getByEmail(email);
        if (user) {
            throw new ApiError(
                "Email is already exist",
                StatusCodesEnum.FORBIDDEN,
            );
        }
    }
}
export const authService = new AuthService();
