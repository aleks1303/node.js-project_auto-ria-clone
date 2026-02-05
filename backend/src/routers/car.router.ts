import { Router } from "express";

import { carController } from "../controllers/car.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { carMiddleware } from "../middleware/car.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { CarValidator } from "../validators/car.validator";

const router = Router();
router.get(
    "/",
    authMiddleware.checkAccessTokenOptional,
    commonMiddleware.query(CarValidator.query),
    carController.getAll,
);
router.post(
    "/create",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.CARS_CREATE),
    commonMiddleware.isBodyValid(CarValidator.create),
    carController.create,
);
router.put(
    "/:carId",
    authMiddleware.checkAccessToken,
    commonMiddleware.isIdValid("carId"),
    authMiddleware.checkPermission(
        PermissionsEnum.CARS_UPDATE_OWN,
        PermissionsEnum.CARS_UPDATE_ALL,
    ),
    carMiddleware.checkOwnerOrManagerCar,
    commonMiddleware.isBodyValid(CarValidator.update),
    carController.update,
);
export const carRouter = router;
