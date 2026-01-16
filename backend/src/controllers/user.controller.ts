import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import { userPresenter } from "../presenters/user.presenter";
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
        const userResponse = userPresenter.toPublicResDto(user);
        res.status(StatusCodesEnum.OK).json({ user: userResponse });
    }

    public async uploadAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const avatar = req.files.avatar as UploadedFile;
            const user = await userService.uploadAvatar(tokenPayload, avatar);
            const result = userPresenter.toPublicResDto(user);
            res.status(201).json(result);
        } catch (e) {
            next(e);
        }
    }

    public async deleteAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await userService.deleteAvatar(tokenPayload);
            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }
}
export const userController = new UserController();
