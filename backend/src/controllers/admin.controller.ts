import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enums/error-enum/status-codes.enum";
import { IAdminCreateDTO } from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { adminService } from "../services/admin.service";

class AdminController {
    public async createAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IAdminCreateDTO;
            const user = await adminService.createAdmin(body);
            const presenter = userPresenter.toPublicResDto(user);
            res.status(StatusCodesEnum.CREATED).json(presenter);
        } catch (e) {
            next(e);
        }
    }
}
export const adminController = new AdminController();
