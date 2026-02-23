import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { isObjectIdOrHexString } from "mongoose";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ApiError } from "../errors/api.error";

class CommonMiddleware {
    public isIdValid(key: string) {
        return (req: Request, _res: Response, next: NextFunction) => {
            try {
                const id = req.params[key];
                if (!isObjectIdOrHexString) {
                    throw new ApiError(
                        `${key}: ${id} invalid Id`,
                        StatusCodesEnum.BAD_REQUEST,
                    );
                }
                next();
            } catch (e) {
                next(e);
            }
        };
    }

    public isBodyValid(validator: ObjectSchema) {
        return async (req: Request, _res: Response, next: NextFunction) => {
            try {
                req.body = await validator.validateAsync(req.body);
                next();
            } catch (e) {
                // next(
                //     new ApiError(
                //         e.details[0].message,
                //         StatusCodesEnum.BAD_REQUEST,
                //     ),
                // );
                let message = e.details[0].message;

                // Видаляємо всі подвійні лапки
                message = message.replace(/"/g, "");

                // Робимо першу літеру великою (опціонально, для краси)
                message = message.charAt(0).toUpperCase() + message.slice(1);

                next(new ApiError(message, StatusCodesEnum.BAD_REQUEST));
            }
        };
    }

    public query(validator: ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                res.locals.validatedQuery = await validator.validateAsync(
                    req.query,
                );
                next();
            } catch (e) {
                next(e);
            }
        };
    }
}
export const commonMiddleware = new CommonMiddleware();
