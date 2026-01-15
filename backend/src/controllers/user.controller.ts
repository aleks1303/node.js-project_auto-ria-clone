import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/status-codes.enum";
import { userService } from "../services/user.service";

class UserController {
    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await userService.getAll();
            res.status(StatusCodesEnum.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getMe(req: Request, res: Response, next: NextFunction) {
        const user = res.locals.user;
        res.status(StatusCodesEnum.OK).json(user);
    }
}
export const userController = new UserController();
