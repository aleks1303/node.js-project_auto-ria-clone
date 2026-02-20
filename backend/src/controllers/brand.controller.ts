import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { ITokenPayload } from "../interfaces/token.interface";
import { BrandPresenter } from "../presenters/brand.presenter";
import { brandService } from "../services/brand.service";

class BrandController {
    public async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const brands = await brandService.getAll();
            const presenter = BrandPresenter.toResponseList(brands);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }

    public async missingBrand(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { brandName } = req.body;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            await brandService.missingBrand(userId, brandName);
            res.status(StatusCodesEnum.OK).json({
                message:
                    "Your message has been sent to the administration. Thank you for your help!",
            });
        } catch (e) {
            next(e);
        }
    }
}
export const brandController = new BrandController();
