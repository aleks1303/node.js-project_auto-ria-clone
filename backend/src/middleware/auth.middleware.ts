import { NextFunction, Request, Response } from "express";

import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ActionTokenTypeEnum } from "../enums/user-enum/action-token-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { RoleEnum } from "../enums/user-enum/role.enum";
import { TokenTypeEnum } from "../enums/user-enum/token-type.enum";
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
    public async checkAccessTokenOptional(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authorizationHeader = req.headers.authorization;
            if (!authorizationHeader) {
                res.locals.permissions = [];
                return next();
            } // Гість? Ок, йди далі.

            const accessToken = authorizationHeader.split(" ")[1];
            if (!accessToken) {
                res.locals.permissions = [];
                return next();
            }

            // Якщо токен надіслали, перевіряємо його
            const payload = tokenService.verifyToken(
                accessToken,
                TokenTypeEnum.ACCESS,
            );
            res.locals.tokenPayload = payload;
            // Записуємо в locals, щоб Controller/Presenter знали, хто це
            res.locals.permissions = rolePermissions[payload.role] || [];
            next();
        } catch {
            res.locals.permissions = [];
            next();
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

    public checkPermission(...requiredPermissions: PermissionsEnum[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const { role } = res.locals.tokenPayload as ITokenPayload;
                const userPermissions = rolePermissions[role] || [];

                // 1. ЗАВЖДИ зберігаємо пермішини в locals
                res.locals.permissions = userPermissions;

                // 2. ПЕРЕВІРКА ПРАВ: виконується ТІЛЬКИ якщо ми передали вимоги в аргументи
                if (requiredPermissions.length > 0) {
                    const hasPermission = requiredPermissions.some((p) =>
                        userPermissions.includes(p),
                    );

                    if (!hasPermission) {
                        throw new ApiError(
                            "Forbidden: You don't have the required permission",
                            StatusCodesEnum.FORBIDDEN,
                        );
                    }
                }
                next();
            } catch (e) {
                next(e);
            }
        };
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
}

export const authMiddleware = new AuthMiddleware();
