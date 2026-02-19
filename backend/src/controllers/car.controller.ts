import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import {
    ICar,
    ICarCreateDto,
    ICarListQuery,
} from "../interfaces/car.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { CarPresenter } from "../presenters/car.presenter";
import { carService } from "../services/car.service";

class CarController {
    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const query = res.locals.validatedQuery as ICarListQuery;
            const permissions = res.locals.permissions || [];
            const { accountType } =
                (res.locals.tokenPayload as ITokenPayload) || {};
            const [entities, total] = await carService.getAll(
                query,
                permissions,
            );
            const presenter = CarPresenter.toListResDto(
                entities,
                total,
                query,
                permissions,
                accountType,
            );

            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICarCreateDto;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const car = await carService.create(body, userId);
            const presenter = CarPresenter.toPublicResCarDto(car);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICar;
            const body = req.body as ICarCreateDto;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const updatedCar = await carService.update(car, body, tokenPayload);
            const presenter = CarPresenter.toPublicResCarDto(updatedCar);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            const { userId, accountType } = res.locals.tokenPayload;
            const permissions = res.locals.permissions;
            const { car, statistics } = await carService.getById(
                carId,
                userId,
                permissions,
            );

            const presenter = CarPresenter.toPublicCarsResDto(
                car,
                permissions,
                accountType,
                statistics,
            );

            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }
    public async deleteCar(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await carService.deleteCar(carId, tokenPayload);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async validate(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            await carService.validate(carId);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const image = req.files.image as UploadedFile;

            const car = await carService.uploadImage(
                tokenPayload,
                carId,
                image,
            );
            const presenter = CarPresenter.toPublicResCarDto(car);
            res.status(StatusCodesEnum.CREATED).json(presenter);
        } catch (e) {
            next(e);
        }
    }
    public async deleteImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await carService.deleteImage(carId, tokenPayload);
            res.status(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }
}

export const carController = new CarController();
