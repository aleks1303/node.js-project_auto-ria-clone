import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import {
    ITokenActionPayload,
    ITokenPayload,
} from "../interfaces/token.interface";
import {
    CheckEmail,
    ForgotPasswordSet,
    ISignInDTO,
    IUserCreateDTO,
} from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { authService } from "../services/auth.service";

class AuthController {
    public async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUserCreateDTO;
            const { user, tokens } = await authService.signUp(body);
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.CREATED).json({
                user: presenter,
                tokens,
            });
        } catch (e) {
            next(e);
        }
    }

    public async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ISignInDTO;
            const { user, tokens } = await authService.signIn(body);
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.OK).json({
                user: presenter,
                tokens,
            });
        } catch (e) {
            next(e);
        }
    }

    public async refresh(_req: Request, res: Response, next: NextFunction) {
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

    public async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body as CheckEmail;
            await authService.verifyEmail(dto);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async verifyTokenFromEmail(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { token } = req.params as { token: string };
            await authService.verifyTokenFromEmail(token);
            res.sendStatus(StatusCodesEnum.OK);
        } catch (e) {
            next(e);
        }
    }
    public async forgotPasswordSendEmail(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const dto = req.body as CheckEmail;
            await authService.forgotPasswordSendEmail(dto);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async forgotPasswordSet(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const tokenPayload = res.locals
                .actionPayload as ITokenActionPayload;
            const dto = req.body as ForgotPasswordSet;
            await authService.forgotPasswordSet(dto, tokenPayload);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }

    public async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload;
            const { refreshToken } = res.locals.refreshToken;
            await authService.logout(userId, refreshToken);
            res.sendStatus(StatusCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    }
}
export const authController = new AuthController();
