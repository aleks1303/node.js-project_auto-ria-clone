import { Router } from "express";

import { carController } from "../controllers/car.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { CarValidator } from "../validators/car.validator";

const router = Router();

router.post(
    "/create",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.CARS_CREATE),
    commonMiddleware.isBodyValid(CarValidator.create),
    carController.create,
);
export const carRouter = router;
