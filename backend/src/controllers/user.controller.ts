import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import { IUserListQuery, IUserUpdateDto } from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { userService } from "../services/user.service";

class UserController {
    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = res.locals.validatedQuery as IUserListQuery;
            const [entities, total] = await userService.getAll(query);
            const result = userPresenter.toListResDto(entities, total, query);
            res.status(StatusCodesEnum.OK).json(result);
        } catch (e) {
            next(e);
        }
    }
    public async getMe(req: Request, res: Response, next: NextFunction) {
        const { userId } = res.locals.tokenPayload as ITokenPayload;
        const tokenPayload = res.locals.tokenPayload as ITokenPayload;

        const user = await userService.getById(userId);
        const userResponse = userPresenter.toDetailsResDto(user, tokenPayload);
        res.status(StatusCodesEnum.OK).json({ user: userResponse });
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.params as { userId: string };
        const tokenPayload = res.locals.tokenPayload as ITokenPayload;

        const user = await userService.getById(userId);
        const userResponse = userPresenter.toDetailsResDto(user, tokenPayload);
        res.status(StatusCodesEnum.OK).json({ user: userResponse });
    }

    public async updateMe(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const dto = req.body as IUserUpdateDto;
            const user = await userService.updateMe(userId, dto);
            res.json(user);
        } catch (e) {
            next(e);
        }
    }

    public async buyPremiumAccount(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const premiumUser = await userService.buyPremiumAccount(userId);
            const userResponse = userPresenter.toDetailsResDto(premiumUser);
            res.status(StatusCodesEnum.OK).json(userResponse);
        } catch (e) {
            next(e);
        }
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
