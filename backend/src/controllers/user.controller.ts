import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import {
    IUserCreateDTO,
    IUserListQuery,
    IUserUpdateDto,
} from "../interfaces/user.interface";
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

    public async userBan(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params as { userId: string };
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await userService.userBan(userId, tokenPayload);
            res.sendStatus(StatusCodesEnum.OK);
        } catch (e) {
            next(e);
        }
    }

    public async createManager(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const dto = req.body as IUserCreateDTO;
            const user = await userService.createManager(dto);
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.OK).json(presenter);
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
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const { user, tokens } = await userService.buyPremiumAccount(
                tokenPayload.userId,
            );
            const userResponse = userPresenter.toDetailsResDto(
                user,
                tokenPayload,
            );
            res.status(StatusCodesEnum.OK).json({
                user: userResponse,
                tokens: tokens,
            });
        } catch (e) {
            next(e);
        }
    }
    public async changeRoleToSeller(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const { user, tokens } = await userService.changeRoleToSeller(
                tokenPayload.userId,
            );
            const userResponse = userPresenter.toDetailsResDto(
                user,
                tokenPayload,
            );
            res.status(StatusCodesEnum.OK).json({
                user: userResponse,
                tokens: tokens,
            });
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
