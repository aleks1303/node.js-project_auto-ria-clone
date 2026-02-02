import { NextFunction, Request, Response } from "express";

import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import { Car } from "../models/car.model";
import { carRepository } from "../repositories/car.repository";

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
    public async checkOwnerOrManagerCar(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { carId } = req.params as { carId: string };
            const { userId, role } = res.locals.tokenPayload as ITokenPayload;
            const car = await carRepository.getById(carId);
            if (!car) {
                throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
            }
            const permissions = rolePermissions[role] || [];
            if (permissions.includes(PermissionsEnum.CARS_UPDATE_ALL)) {
                res.locals.car = car;
                return next();
            }
            if (car._userId.toString() !== userId) {
                throw new ApiError(
                    "You are not the owner of this car",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
            res.locals.car = car;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export const carMiddleware = new CarMiddleware();
