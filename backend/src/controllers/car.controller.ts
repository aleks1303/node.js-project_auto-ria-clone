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
            const { role, accountType } =
                (res.locals.tokenPayload as ITokenPayload) || {};
            const [entities, total] = await carService.getAll(query, role);
            const result = CarPresenter.toListResDto(
                entities,
                total,
                query,
                role,
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
            const updatedCar = await carService.update(car, body);
            const carResponse = CarPresenter.toPublicResCarDto(updatedCar);
            res.status(StatusCodesEnum.OK).json(carResponse);
        } catch (e) {
            next(e);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            const { userId, role, accountType } = res.locals.tokenPayload;

            const { car, statistics } = await carService.getById(carId, userId);

            const response = CarPresenter.toPublicCarsResDto(
                car,
                role,
                accountType,
                statistics,
            );

            res.status(StatusCodesEnum.OK).json(response);
        } catch (e) {
            next(e);
        }
    }
    // car.controller.ts
    // public async getById(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { role, accountType } = res.locals.tokenPayload;
    //         const { carId } = req.params as { carId: string };
    //         const { userId } = res.locals.tokenPayload;
    //
    //         const { car, averagePrice } = await carService.getById(
    //             carId,
    //             userId,
    //         );
    //
    //         // Використовуємо Presenter тут
    //         const response = CarPresenter.toPublicCarsResDto(
    //             car,
    //             role,
    //             accountType,
    //             averagePrice,
    //         );
    //
    //         res.status(StatusCodesEnum.OK).json(response);
    //     } catch (e) {
    //         next(e);
    //     }
    // }

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
            await carService.deleteCar(carId, tokenPayload);
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
