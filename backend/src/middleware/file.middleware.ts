import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ApiError } from "../errors/api.error";
import { IFileConfig } from "../interfaces/file-config.interface";

class FileMiddleware {
    public isFileValid(fieldName: string, config: IFileConfig) {
        return (req: Request, _res: Response, next: NextFunction) => {
            try {
                if (!req.files || !req.files[fieldName]) {
                    throw new ApiError(
                        "File not found",
                        StatusCodesEnum.NOT_FOUND,
                    );
                }
                const file = req.files[fieldName] as UploadedFile;
                if (Array.isArray(file)) {
                    throw new ApiError(
                        "Please upload files one by one or update middleware",
                        StatusCodesEnum.BAD_REQUEST,
                    );
                }
                if (file.size > config.maxSize) {
                    throw new ApiError(
                        `File too large. Max: ${config.maxSize / (1024 * 1024)}MB`,
                        StatusCodesEnum.FORBIDDEN,
                    );
                }

                if (!config.mimes.includes(file.mimetype)) {
                    throw new ApiError(
                        `Invalid type. Allowed: ${config.mimes.join(", ")}`,
                        StatusCodesEnum.BAD_REQUEST,
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
