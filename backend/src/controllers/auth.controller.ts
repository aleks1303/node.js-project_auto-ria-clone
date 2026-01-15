import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import { ISignInDTO, IUserCreateDTO } from "../interfaces/user.interface";
import { authService } from "../services/auth.service";

class AuthController {
    public async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUserCreateDTO;
            const data = await authService.signUp(body);
            res.status(StatusCodesEnum.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ISignInDTO;
            const data = await authService.signIn(body);
            res.status(StatusCodesEnum.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = res.locals.refreshToken as string;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const tokens = await authService.refresh(
                refreshToken,
                tokenPayload,
            );

            res.status(StatusCodesEnum.CREATED).json({ tokens });
        } catch (e) {
            next(e);
        }
    }
}
export const authController = new AuthController();
