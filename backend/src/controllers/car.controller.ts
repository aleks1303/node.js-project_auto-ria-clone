import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ICarCreateDto } from "../interfaces/car.interface";
import { ITokenPayload } from "../interfaces/token.interface";
import { CarPresenter } from "../presenters/car.presenter";
import { carService } from "../services/car.service";

class CarController {
    public async getAllCars() {}
    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            // Витягуємо юзера, якого поклала туди authMiddleware
            const body = req.body as ICarCreateDto;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            // Передаємо в сервіс дані авто та ID власника окремо
            const car = await carService.create(body, userId);
            const carResponse = CarPresenter.toPublicResCarDto(car);
            res.status(StatusCodesEnum.OK).json(carResponse);
        } catch (e) {
            next(e);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { carId } = req.params as { carId: string };
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const body = req.body as ICarCreateDto;
            const updatedCar = await carService.update(carId, userId, body);
            const carResponse = CarPresenter.toPublicResCarDto(updatedCar);
            res.status(StatusCodesEnum.OK).json(carResponse);
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
