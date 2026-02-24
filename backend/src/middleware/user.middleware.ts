import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import { userRepository } from "../repositories/user.repository";

class UserMiddleware {
    public async getMeOrThrow(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const user = await userRepository.getById(userId);
            if (!user) {
                throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
            }
            res.locals.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }
    public async getByIdOrThrow(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = req.params as { userId: string };
            const user = await userRepository.getById(userId);
            if (!user) {
                throw new ApiError("User not found", StatusCodesEnum.NOT_FOUND);
            }
            res.locals.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export const userMiddleware = new UserMiddleware();
