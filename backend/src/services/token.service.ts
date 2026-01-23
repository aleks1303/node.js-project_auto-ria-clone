import jwt, { SignOptions } from "jsonwebtoken";

import { config } from "../configs/config";
import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { StatusCodesEnum } from "../enums/status-codes.enum";
import { TokenTypeEnum } from "../enums/token-type.enum";
import { ApiError } from "../errors/api.error";
import {
    ITokenActionPayload,
    ITokenPair,
    ITokenPayload,
} from "../interfaces/token.interface";
import { tokenRepository } from "../repositories/token.repository";

class TokenService {
    private getSecret(type: TokenTypeEnum | ActionTokenTypeEnum): {
        secret: string;
        expiresIn?: string;
    } {
        switch (type) {
            case TokenTypeEnum.ACCESS:
                return {
                    secret: config.JWT_ACCESS_SECRET,
                    expiresIn: config.JWT_ACCESS_EXPIRATION,
                };
            case TokenTypeEnum.REFRESH:
                return {
                    secret: config.JWT_REFRESH_SECRET,
                    expiresIn: config.JWT_REFRESH_EXPIRATION,
                };
            case ActionTokenTypeEnum.VERIFY_EMAIL:
                return {
                    secret: config.JWT_ACTION_VERIFY_SECRET,
                    expiresIn: config.JWT_ACTION_VERIFY_EXPIRATION,
                };
            case ActionTokenTypeEnum.FORGOT_PASSWORD:
                return {
                    secret: config.JWT_ACTION_SECRET,
                    expiresIn: config.JWT_ACTION_EXPIRATION,
                };
            default:
                throw new ApiError(
                    "Invalid token type",
                    StatusCodesEnum.BAD_REQUEST,
                );
        }
    }

    public generateTokens(payload: ITokenPayload): ITokenPair {
        const { secret: accessSecret, expiresIn: accessExpiresIn } =
            this.getSecret(TokenTypeEnum.ACCESS);
        const { secret: refreshSecret, expiresIn: refreshExpiresIn } =
            this.getSecret(TokenTypeEnum.REFRESH);

        return {
            accessToken: jwt.sign(payload, accessSecret, {
                expiresIn: accessExpiresIn,
            } as SignOptions),
            refreshToken: jwt.sign(payload, refreshSecret, {
                expiresIn: refreshExpiresIn,
            } as SignOptions),
        };
    }

    public generateActionToken(
        payload: ITokenActionPayload,
        type: ActionTokenTypeEnum,
    ): string {
        const { secret, expiresIn } = this.getSecret(type);
        return jwt.sign(payload, secret, { expiresIn } as SignOptions);
    }

    public verifyToken(
        token: string,
        type: TokenTypeEnum | ActionTokenTypeEnum,
    ): ITokenPayload {
        try {
            const { secret } = this.getSecret(type);
            return jwt.verify(token, secret) as ITokenPayload;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            throw new ApiError("Invalid token", StatusCodesEnum.UNAUTHORIZED);
        }
    }
    public async isTokenExists(
        token: string,
        type: TokenTypeEnum,
    ): Promise<boolean> {
        if (type === TokenTypeEnum.ACCESS) {
            return true;
        }
        const foundToken = await tokenRepository.findByParams({
            refreshToken: token,
        });
        return !!foundToken;
    }
}

export const tokenService = new TokenService();

// public verifyToken(
//     token: string,
//     type: TokenTypeEnum | ActionTokenTypeEnum,
// ): ITokenPayload {
//     try {
//         let secret: string;
//
//         switch (type) {
//             case TokenTypeEnum.ACCESS:
//                 secret = config.JWT_ACCESS_SECRET;
//                 break;
//             case TokenTypeEnum.REFRESH:
//                 secret = config.JWT_REFRESH_SECRET;
//                 break;
//             case ActionTokenTypeEnum.ACTIVATE:
//                 secret = config.JWT_ACTIVATE_SECRET;
//                 break;
//             case ActionTokenTypeEnum.RECOVERY:
//                 secret = config.JWT_RECOVERY_SECRET;
//                 break;
//             default:
//                 throw new ApiError(
//                     "Invalid token type",
//                     StatusCodesEnum.BAD_REQUEST,
//                 );
//         }
//         return jwt.verify(token, secret) as ITokenPayload;
//
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (e) {
//         throw new ApiError("Invalid token", StatusCodesEnum.UNAUTHORIZED);
//     }
// }
// public generateActionToken(
//     payload: ITokenPayload,
//     type: ActionTokenTypeEnum,
// ): string {
//     let secret: string;
//     let expiresIn: any;
//
//     switch (type) {
//         case ActionTokenTypeEnum.ACTIVATE:
//             secret = config.JWT_ACTIVATE_SECRET;
//             expiresIn = config.JWT_ACTIVATE_LIFETIME;
//             break;
//         case ActionTokenTypeEnum.RECOVERY:
//             secret = config.JWT_RECOVERY_SECRET;
//             expiresIn = config.JWT_RECOVERY_LIFETIME;
//             break;
//         default:
//             throw new ApiError("Invalid action token type", 400);
//     }
//     return jwt.sign(payload, secret, { expiresIn });
// }
