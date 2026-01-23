import { NextFunction, Request, Response } from "express";

import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { RoleEnum } from "../enums/role.enum";
import { StatusCodesEnum } from "../enums/status-codes.enum";
import { TokenTypeEnum } from "../enums/token-type.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import { ForgotPasswordSet } from "../interfaces/user.interface";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { userRepository } from "../repositories/user.repository";
import { tokenService } from "../services/token.service";

class AuthMiddleware {
    public async checkAccessToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authorizationHeader = req.headers.authorization;

            if (!authorizationHeader) {
                throw new ApiError(
                    "No token provided",
                    StatusCodesEnum.UNAUTHORIZED,
                );
            }

            const accessToken = authorizationHeader.split(" ")[1];

            if (!accessToken) {
                throw new ApiError(
                    "No token provided",
                    StatusCodesEnum.UNAUTHORIZED,
                );
            }

            const tokenPayload = tokenService.verifyToken(
                accessToken,
                TokenTypeEnum.ACCESS,
            );
            const user = await userRepository.getById(tokenPayload.userId);

            if (!user) {
                throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
            }

            if (!user.isActive) {
                throw new ApiError(
                    "Account is not active",
                    StatusCodesEnum.FORBIDDEN,
                );
            }

            res.locals.tokenPayload = tokenPayload;
            res.locals.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }

    public async checkRefreshToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            // const { refreshToken } = req.body as IRefresh;
            const header = req.headers.authorization;
            if (!header) {
                throw new ApiError("Header is provided", 401);
            }
            const refreshToken = header.split("Bearer ")[1];
            if (!refreshToken) {
                throw new ApiError(
                    "No refresh token provided",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
            const tokenPayload = tokenService.verifyToken(
                refreshToken,
                TokenTypeEnum.REFRESH,
            );
            const isTokenExists = await tokenService.isTokenExists(
                refreshToken,
                TokenTypeEnum.REFRESH,
            );

            if (!isTokenExists) {
                throw new ApiError("Invalid token", StatusCodesEnum.FORBIDDEN);
            }
            res.locals.refreshToken = refreshToken;
            res.locals.tokenPayload = tokenPayload;

            next();
        } catch (e) {
            next(e);
        }
    }

    public async checkActionToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { actionToken } = req.body as ForgotPasswordSet;
            if (!actionToken) {
                throw new ApiError(
                    "Token is required",
                    StatusCodesEnum.BAD_REQUEST,
                );
            }
            const payload = tokenService.verifyToken(
                actionToken,
                ActionTokenTypeEnum.FORGOT_PASSWORD,
            );
            const actionTokenEntity =
                await actionTokenRepository.getByToken(actionToken);
            if (!actionTokenEntity) {
                throw new ApiError("Token is not valid", 401);
            }
            res.locals.actionPayload = payload;
            next();
        } catch (e) {
            next(e);
        }
    }

    public checkRole(roles: RoleEnum[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const { role } = res.locals.tokenPayload as ITokenPayload;
                if (!roles.includes(role)) {
                    throw new ApiError(
                        "Access denied. High level of clearance required",
                        StatusCodesEnum.FORBIDDEN,
                    );
                }
                next();
            } catch (e) {
                next(e);
            }
        };
    }
    // на видалення
    // public isAdmin(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { role } = req.res.locals.tokenPayload as ITokenPayload;
    //
    //         if (role !== RoleEnum.ADMIN) {
    //             throw new ApiError(
    //                 "No has permissions",
    //                 StatusCodesEnum.FORBIDDEN,
    //             );
    //         }
    //         next();
    //     } catch (e) {
    //         next(e);
    //     }
    // }
}

export const authMiddleware = new AuthMiddleware();
