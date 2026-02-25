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
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.CARS_CREATE),
    commonMiddleware.isBodyValid(CarValidator.create),
    carMiddleware.checkCarLimit,
    carController.create,
);

router.post(
    "/:carId/image",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isIdValid("carId"),
    carMiddleware.getByIdOrThrow,
    fileMiddleware.isFileValid("image", carImageConfig),
    carController.uploadImage,
);
router.delete(
    "/:carId/image",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isIdValid("carId"),
    carMiddleware.getByIdOrThrow,
    carController.deleteImage,
);

router.get(
    "/:carId",
    authMiddleware.checkAccessToken,
    commonMiddleware.isIdValid("carId"),
    carMiddleware.getByIdOrThrow,
    authMiddleware.checkPermission(),
    carController.getById,
);

router.put(
    "/:carId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isIdValid("carId"),
    carMiddleware.getByIdOrThrow,
    authMiddleware.checkPermission(
        PermissionsEnum.CARS_UPDATE_OWN,
        PermissionsEnum.CARS_UPDATE_ALL,
    ),
    commonMiddleware.isBodyValid(CarValidator.update),
    carController.update,
);

router.delete(
    "/:carId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isIdValid("carId"),
    carMiddleware.getByIdOrThrow,
    authMiddleware.checkPermission(),
    carController.deleteCar,
);

router.patch(
    "/:carId/validate",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isIdValid("carId"),
    carMiddleware.getByIdOrThrow,
    authMiddleware.checkPermission(PermissionsEnum.ADS_VALIDATE),
    carController.validate,
);
export const carRouter = router;
