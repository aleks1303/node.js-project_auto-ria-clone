import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import {
    IUserCreateDTO,
    IUserListQuery,
    IUserUpdateDto,
    UpgradeUserDto,
} from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { userService } from "../services/user.service";

class UserController {
    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const query = res.locals.validatedQuery as IUserListQuery;
            const [entities, total] = await userService.getAll(query);
            const presenter = userPresenter.toListResDto(
                entities,
                total,
                query,
            );
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }
    public async getMe(_req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const user = await userService.getById(userId);
            const presenter = userPresenter.toDetailsResDto(user, tokenPayload);
            res.status(StatusCodesEnum.OK).json({ user: presenter });
        } catch (e) {
            next(e);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params as { userId: string };
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const user = await userService.getById(userId);
            const presenter = userPresenter.toDetailsResDto(user, tokenPayload);
            res.status(StatusCodesEnum.OK).json({ user: presenter });
        } catch (e) {
            next(e);
        }
    }

    public async updateMe(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const dto = req.body as IUserUpdateDto;
            const user = await userService.updateMe(userId, dto);
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params as { userId: string };
            const { userId: adminId, role } = res.locals
                .tokenPayload as ITokenPayload;
            await userService.deleteById(userId, role, adminId);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async userBan(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params as { userId: string };
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await userService.userBan(userId, tokenPayload);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
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
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const { user, tokens } = await userService.buyPremiumAccount(
                tokenPayload.userId,
            );
            const presenter = userPresenter.toDetailsResDto(user, tokenPayload);
            res.status(StatusCodesEnum.OK).json({
                user: presenter,
                tokens: tokens,
            });
        } catch (e) {
            next(e);
        }
    }
    public async changeRoleToSeller(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const { user, tokens } = await userService.changeRoleToSeller(
                tokenPayload.userId,
            );
            const presenter = userPresenter.toDetailsResDto(user, tokenPayload);
            res.status(StatusCodesEnum.OK).json({
                user: presenter,
                tokens: tokens,
            });
        } catch (e) {
            next(e);
        }
    }

    public async upgradeUserRole(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = req.params as { userId: string };
            const { userId: adminId } = res.locals
                .tokenPayload as ITokenPayload;
            const body = req.body as UpgradeUserDto;
            const user = await userService.upgradeUserRole(
                adminId,
                userId,
                body,
            );
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async uploadAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const avatar = req.files.avatar as UploadedFile;
            const user = await userService.uploadAvatar(userId, avatar);
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.CREATED).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async deleteAvatar(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            await userService.deleteAvatar(userId);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }
}
export const userController = new UserController();
