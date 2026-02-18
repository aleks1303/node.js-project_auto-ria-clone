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
    // car.controller.ts
    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = res.locals.validatedQuery as ICarListQuery;
            const permissions = res.locals.permissions || [];
            const { accountType } =
                (res.locals.tokenPayload as ITokenPayload) || {};
            const [entities, total] = await carService.getAll(
                query,
                permissions,
            );
            const result = CarPresenter.toListResDto(
                entities,
                total,
                query,
                permissions,
                accountType,
            );

            res.status(StatusCodesEnum.OK).json(result);
        } catch (e) {
            next(e);
        }
    }
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICarCreateDto;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const car = await carService.create(body, userId);
            const carResponse = CarPresenter.toPublicResCarDto(car);
            res.status(StatusCodesEnum.OK).json(carResponse);
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
            const carResponse = CarPresenter.toPublicResCarDto(updatedCar);
            res.status(StatusCodesEnum.OK).json(carResponse);
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

            const response = CarPresenter.toPublicCarsResDto(
                car,
                permissions, // 2-й аргумент
                accountType, // 3-й аргумент
                statistics, // 4-й аргумент
            );

            res.status(StatusCodesEnum.OK).json(response);
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
            // Тут можна використати carPresenter, якщо він є
            res.status(201).json(car);
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

//   public async uploadImage(req: Request, res: Response, next: NextFunction) {
//     try {
//         const { carId } = req.params;
//         const file = req.files.image as UploadedFile;
//         const car = await carService.getById(carId); // Знаходимо машину
//
//         // Викликаємо твій S3 сервіс
//         const filePath = await s3Service.uploadFile(
//             file,
//             FileItemTypeEnum.CAR,
//             carId,
//             car.image // Передаємо старий шлях, щоб S3 його видалив
//         );
//
//         // Оновлюємо шлях у базі даних
//         const updatedCar = await carService.updateById(carId, { image: filePath });
//
//         res.json(updatedCar);
//     } catch (e) {
//         next(e);
//     }
// }
