import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { accountTypeEnum } from "../enums/user-enum/account-type.enum";
import { ApiError } from "../errors/api.error";
import { ICarPopulated } from "../interfaces/car.interface";
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
    public async getByIdOrThrow(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { carId } = req.params as { carId: string };
            const car = (await carRepository.getById(
                carId,
            )) as unknown as ICarPopulated;
            if (!car) {
                throw new ApiError("Car not found", StatusCodesEnum.NOT_FOUND);
            }
            res.locals.car = car;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export const carMiddleware = new CarMiddleware();
