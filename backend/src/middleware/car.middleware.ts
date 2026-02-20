import { NextFunction, Request, Response } from "express";

import { rolePermissions } from "../constants/permissions.constant";
import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/token.interface";
import { carRepository } from "../repositories/car.repository";

class CarMiddleware {
    public async checkCarLimit(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { _id, accountType } = res.locals.user; // Дані юзера після authMiddleware
            if (accountType === accountTypeEnum.PREMIUM) {
                return next();
            }
            const carCount = await carRepository.countByUserId(_id);
            if (carCount >= 1) {
                throw new ApiError(
                    "Basis account limit reached. Please upgrade to Premium to add more cars.",
                    StatusCodesEnum.FORBIDDEN,
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
