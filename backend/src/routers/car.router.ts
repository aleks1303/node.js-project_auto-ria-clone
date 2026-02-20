import { Router } from "express";

import { carImageConfig } from "../configs/car-image.config";
import { carController } from "../controllers/car.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { carMiddleware } from "../middleware/car.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { fileMiddleware } from "../middleware/file.middleware";
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
    carMiddleware.checkCarLimit,
    carController.create,
);

router.post(
    "/:carId/image",
    authMiddleware.checkAccessToken,
    fileMiddleware.isFileValid("image", carImageConfig),
    carController.uploadImage,
);
router.delete(
    "/:carId/image",
    authMiddleware.checkAccessToken,
    carController.deleteImage,
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

// car.router.ts
router.get(
    "/:carId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(),
    carController.getById,
);

router.delete(
    "/:carId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(),
    carController.deleteCar,
);

router.patch(
    "/:carId/validate",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.ADS_VALIDATE),
    carController.validate,
);
export const carRouter = router;
