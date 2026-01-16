import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { ApiError } from "../errors/api.error";
import { IFileConfig } from "../interfaces/file-config.interface";

class FileMiddleware {
    public isFileValid(fieldName: string, config: IFileConfig) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                // 1. Перевіряємо чи взагалі щось прийшло
                if (!req.files || !req.files[fieldName]) {
                    throw new ApiError("File not found", 400);
                }

                const file = req.files[fieldName] as UploadedFile;

                // 2. Якщо прийшов масив (наприклад для машин),
                // беремо перший файл для простої перевірки (або видаємо помилку)
                if (Array.isArray(file)) {
                    throw new ApiError(
                        "Please upload files one by one or update middleware",
                        400,
                    );
                }

                // 3. Перевірка розміру та типу
                if (file.size > config.maxSize) {
                    throw new ApiError(
                        `File too large. Max: ${config.maxSize / (1024 * 1024)}MB`,
                        400,
                    );
                }

                if (!config.mimes.includes(file.mimetype)) {
                    throw new ApiError(
                        `Invalid type. Allowed: ${config.mimes.join(", ")}`,
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
//
// class FileMiddleware {
//     public isFileValid() {
//         const { maxSize, mimes } = avatarConfig;
//         return (req: Request, res: Response, next: NextFunction) => {
//             try {
//                 if (!req.files || !req.files.avatar) {
//                     throw new ApiError("File is not exist", 400);
//                 }
//                 const file = req.files.avatar as UploadedFile;
//                 if (file.size > maxSize) {
//                     throw new ApiError("large file allowed up to 5Mb", 400);
//                 }
//                 if (!mimes.includes(file.mimetype)) {
//                     // noinspection ExceptionCaughtLocallyJS
//                     throw new ApiError(
//                         `invalid file type, require ${mimes.join(", ")}`,
//                         400,
//                     );
//                 }
//                 next();
//             } catch (e) {
//                 next(e);
//             }
//         };
//     }
// }

// це на майбутьне щоб перевіряти фото на розмір чи формат чи існує це універсальна для всього
// а використовувати так:
// Для профілю юзера
// router.post("/me/avatar", fileMiddleware.isFileValid("avatar"), userController.uploadAvatar);
//
// // Для оголошення машини
// router.post("/cars/:id/photos", fileMiddleware.isFileValid("photo"), carController.uploadPhoto);

// Додаємо параметр fieldName
// public isFileValid(fieldName: string) {
//     const { maxSize, mimes } = avatarConfig; // Можна також передавати конфіг аргументом
//
//     return (req: Request, res: Response, next: NextFunction) => {
//         try {
//             // Динамічно перевіряємо поле за назвою (avatar, photo, etc.)
//             if (!req.files || !req.files[fieldName]) {
//                 throw new ApiError("File does not exist", 400);
//             }
//
//             const file = req.files[fieldName] as UploadedFile;
//
//             if (file.size > maxSize) {
//                 throw new ApiError(
//                     `File too large. Max size is ${maxSize / (1024 * 1024)}Mb`,
//                     400,
//                 );
//             }
//
//             if (!mimes.includes(file.mimetype)) {
//                 throw new ApiError(
//                     `Invalid file type. Allowed: ${mimes.join(", ")}`,
//                     400,
//                 );
//             }
//
//             next();
//         } catch (e) {
//             next(e);
//         }
//     };
// }

// це для машин фото та avatar
// file.middleware.ts
// public isFileValid(fieldName: string, config: { maxSize: number; mimes: string[] }) {
//     return (req: Request, res: Response, next: NextFunction) => {
//         const file = req.files?.[fieldName] as UploadedFile;
//
//         if (!file) return next(new ApiError("File not found", 400));
//
//         if (file.size > config.maxSize) {
//             return next(new ApiError("File too large", 400));
//         }
//
//         if (!config.mimes.includes(file.mimetype)) {
//             return next(new ApiError("Invalid type", 400));
//         }
//
//         next();
//     };
// }
