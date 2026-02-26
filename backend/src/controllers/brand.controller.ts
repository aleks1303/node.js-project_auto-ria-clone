import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { IBrand } from "../interfaces/brand.interface";
import { IUser } from "../interfaces/user.interface";
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
            const { brand } = req.body;
            const user = res.locals.user as IUser;
            await brandService.missingBrand(user, brand);
            res.status(StatusCodesEnum.OK).json({
                message:
                    "Your message has been sent to the administration. Thank you for your help!",
            });
        } catch (e) {
            next(e);
        }
    }

    public async addBrandAndModels(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { brand, models } = req.body as IBrand;
            const updatedBrand = await brandService.addBrandAndModels(
                brand,
                models,
            );
            res.status(StatusCodesEnum.OK).json(updatedBrand);
        } catch (e) {
            next(e);
        }
    }
}
export const brandController = new BrandController();
