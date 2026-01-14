import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/status-codes.enum";
import { IUserCreateDTO } from "../interfaces/user.interface";
import { authService } from "../services/auth.service";

class AuthController {
    public async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUserCreateDTO;
            console.log(body);
            const data = await authService.signUp(body);
            res.status(StatusCodesEnum.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }
}
export const authController = new AuthController();
