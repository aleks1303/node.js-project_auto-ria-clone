import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import {
    ICarCreateDto,
    ICarListQuery,
    ICarPopulated,
} from "../interfaces/car.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { CarPresenter } from "../presenters/car.presenter";
import { carService } from "../services/car.service";

class CarController {
    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const query = res.locals.validatedQuery as ICarListQuery;
            const permissions = res.locals.permissions || [];
            const [entities, total] = await carService.getAll(
                query,
                permissions,
            );
            const presenter = CarPresenter.toListResDto(
                entities,
                total,
                query,
                permissions,
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
            const presenter = CarPresenter.toCreateResCarDto(car);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICarPopulated;
            const body = req.body as ICarCreateDto;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const updatedCar = await carService.update(car, body, tokenPayload);
            const presenter = CarPresenter.toCreateResCarDto(updatedCar);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async getById(_req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICarPopulated;
            const { userId, accountType } = res.locals.tokenPayload;
            const permissions = res.locals.permissions;
            const { statistics } = await carService.getById(
                car,
                userId,
                permissions,
            );
            const presenter = CarPresenter.toDetailedCarResDto(
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
    public async deleteCar(_req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICarPopulated;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await carService.deleteCar(car, tokenPayload);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async validate(_req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICarPopulated;
            await carService.validate(car._id.toString());
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICarPopulated;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const image = req.files.image as UploadedFile;
            const carToRes = await carService.uploadImage(
                tokenPayload,
                car,
                image,
            );
            const presenter = CarPresenter.toCreateResCarDto(carToRes);
            res.status(StatusCodesEnum.CREATED).json(presenter);
        } catch (e) {
            next(e);
        }
    }
    public async deleteImage(_req: Request, res: Response, next: NextFunction) {
        try {
            const car = res.locals.car as ICarPopulated;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await carService.deleteImage(car, tokenPayload);
            res.status(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }
}

export const carController = new CarController();
