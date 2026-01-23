import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/status-codes.enum";
import {
    ITokenActionPayload,
    ITokenPayload,
} from "../interfaces/token.interface";
import {
    ForgotPasswordSend,
    ForgotPasswordSet,
    ISignInDTO,
    IUserCreateDTO,
    IVerifyType,
} from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { authService } from "../services/auth.service";

class AuthController {
    public async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUserCreateDTO;
            const { user, tokens } = await authService.signUp(body);
            const userResponse = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.CREATED).json({
                user: userResponse,
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
            const userResponse = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.OK).json({
                user: userResponse,
                tokens,
            });
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

    public async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body as IVerifyType;
            await authService.verify(dto);
            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    public async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.params as { token: string };
            await authService.verifyTokenEmail(token);
            res.sendStatus(200);
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
            const dto = req.body as ForgotPasswordSend;
            await authService.forgotPasswordSendEmail(dto);
            res.sendStatus(204);
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
            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload;
            const { refreshToken } = res.locals.refreshToken;

            await authService.logout(userId, refreshToken);
            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }
}
export const authController = new AuthController();
