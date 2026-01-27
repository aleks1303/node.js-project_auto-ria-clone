import { NextFunction, Request, Response } from "express";

import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { ApiError } from "../errors/api.error";
import { Car } from "../models/car.model";

class CarMiddleware {
    public async checkCarLimit(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { _id, accountType } = res.locals.user; // Дані юзера після authMiddleware

            // Якщо юзер має Premium - він може створювати скільки завгодно оголошень
            if (accountType === accountTypeEnum.PREMIUM) {
                return next();
            }

            // Якщо юзер на базовому тарифі - перевіряємо кількість його машин
            const carCount = await Car.countDocuments({ _userId: _id });

            if (carCount >= 1) {
                throw new ApiError(
                    "Basis account limit reached. Please upgrade to Premium to add more cars.",
                    403,
                );
            }

            next();
        } catch (e) {
            next(e);
        }
    }
}

export const carMiddleware = new CarMiddleware();
