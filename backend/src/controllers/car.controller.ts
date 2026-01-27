class CarController {
    // public async create(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         // Витягуємо юзера, якого поклала туди authMiddleware
    //         const body = req.body as ICarCreateDto;
    //         const { userId } = res.locals.tokenPayload as ITokenPayload;
    //         // Передаємо в сервіс дані авто та ID власника окремо
    //         const car = await carService.create(body, userId);
    //         const carResponse = CarPresenter.toPublicResCarDto(car);
    //         res.status(201).json(carResponse);
    //     } catch (e) {
    //         next(e);
    //     }
    // }

    public async getAllCars() {}
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

// public async uploadImage(req: Request, res: Response, next: NextFunction) {
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
