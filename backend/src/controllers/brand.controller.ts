import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { BrandPresenter } from "../presenters/brand.presenter";
import { brandService } from "../services/brand.service";

class BrandController {
    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const brands = await brandService.getAll();
            const presenter = BrandPresenter.toResponseList(brands);
            res.status(StatusCodesEnum.OK).json(presenter);
        } catch (e) {
            next(e);
        }
    }
}
export const brandController = new BrandController();
