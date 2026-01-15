import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { avatarConfig } from "../configs/avatar.config";
import { ApiError } from "../errors/api.error";

class FileMiddleware {
    public isFileValid() {
        const { maxSize, mimes } = avatarConfig;
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.files || !req.files.avatar) {
                    throw new ApiError("File is not exist", 400);
                }
                const file = req.files.avatar as UploadedFile;
                if (file.size > maxSize) {
                    throw new ApiError("large file allowed up to 5Mb", 400);
                }
                if (!mimes.includes(file.mimetype)) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new ApiError(
                        `invalid file type, require ${mimes.join(", ")}`,
                        400,
                    );
                }
                next();
            } catch (e) {
                next(e);
            }
        };
    }
}
export const fileMiddleware = new FileMiddleware();

// це на майбутьне щоб перевіряти фото на розмір чи формат чи існує це універсальна для всього
// а використовувати так:
// Для профілю юзера
// router.post("/me/avatar", fileMiddleware.isFileValid("avatar"), userController.uploadAvatar);
//
// // Для оголошення машини
// router.post("/cars/:id/photos", fileMiddleware.isFileValid("photo"), carController.uploadPhoto);

// class FileMiddleware {
//     // Додаємо параметр fieldName
//     public isFileValid(fieldName: string) {
//         const { maxSize, mimes } = avatarConfig; // Можна також передавати конфіг аргументом
//
//         return (req: Request, res: Response, next: NextFunction) => {
//             try {
//                 // Динамічно перевіряємо поле за назвою (avatar, photo, etc.)
//                 if (!req.files || !req.files[fieldName]) {
//                     throw new ApiError("File does not exist", 400);
//                 }
//
//                 const file = req.files[fieldName] as UploadedFile;
//
//                 if (file.size > maxSize) {
//                     throw new ApiError(`File too large. Max size is ${maxSize / (1024 * 1024)}Mb`, 400);
//                 }
//
//                 if (!mimes.includes(file.mimetype)) {
//                     throw new ApiError(
//                         `Invalid file type. Allowed: ${mimes.join(", ")}`,
//                         400,
//                     );
//                 }
//
//                 next();
//             } catch (e) {
//                 next(e);
//             }
//         };
//     }
// }
