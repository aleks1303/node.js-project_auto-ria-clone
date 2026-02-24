import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import {
    IUser,
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
            const user = res.locals.user as IUser;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const presenter = userPresenter.toDetailsResDto(user, tokenPayload);
            res.status(StatusCodesEnum.OK).json({ user: presenter });
        } catch (e) {
            next(e);
        }
    }

    public async updateMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as IUser;
            const dto = req.body as IUserUpdateDto;
            const updatedUser = await userService.updateMe(user, dto);
            const presenter = userPresenter.toPublicResDto(updatedUser);
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
            const user = res.locals.user as IUser;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const { user: updatedUser, tokens } =
                await userService.buyPremiumAccount(user);
            const presenter = userPresenter.toDetailsResDto(
                updatedUser,
                tokenPayload,
            );
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
            const user = res.locals.user as IUser;
            const { user: updatedUser, tokens } =
                await userService.changeRoleToSeller(user);
            const presenter = userPresenter.toDetailsResDto(
                updatedUser,
                res.locals.tokenPayload,
            );
            res.status(StatusCodesEnum.OK).json({
                user: presenter,
                tokens: tokens,
            });
        } catch (e) {
            next(e);
        }
    }

    public async uploadAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as IUser;
            const avatar = req.files.avatar as UploadedFile;
            const updatedUser = await userService.uploadAvatar(user, avatar);
            const presenter = userPresenter.toPublicResDto(updatedUser);
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
            const user = res.locals.user as IUser;
            await userService.deleteAvatar(user);
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

    public async upgradeUserRole(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const user = res.locals.user as IUser;
            const { userId: adminId } = res.locals
                .tokenPayload as ITokenPayload;
            const body = req.body as UpgradeUserDto;
            const updatedUser = await userService.upgradeUserRole(
                adminId,
                user,
                body,
            );
            const presenter = userPresenter.toPublicResDto(updatedUser);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async getById(_req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as IUser;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            const getUser = await userService.getById(user);
            const presenter = userPresenter.toDetailsResDto(
                getUser,
                tokenPayload,
            );
            res.status(StatusCodesEnum.OK).json({ user: presenter });
        } catch (e) {
            next(e);
        }
    }

    public async userBan(_req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as IUser;
            const tokenPayload = res.locals.tokenPayload as ITokenPayload;
            await userService.userBan(user, tokenPayload);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async delete(_req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as IUser;
            const { userId: adminId, role } = res.locals
                .tokenPayload as ITokenPayload;
            await userService.deleteById(user, role, adminId);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }
}
export const userController = new UserController();
