import { Router } from "express";

import { brandController } from "../controllers/brand.controller";
import { carController } from "../controllers/car.controller";
import { userController } from "../controllers/user.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { carMiddleware } from "../middleware/car.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { BrandValidator } from "../validators/brand.validator";
import { UserValidator } from "../validators/user.validator";

const router = Router();
router.get(
    "/",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.USERS_GET_ALL),
    commonMiddleware.query(UserValidator.query),
    userController.getAll,
);
router.patch(
    "/:userId/ban",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.USERS_BAN),
    commonMiddleware.isIdValid("userId"),
    userMiddleware.getByIdOrThrow,
    userController.userBan,
);

router.patch(
    "/:userId/unban",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.USERS_BAN),
    commonMiddleware.isIdValid("userId"),
    userMiddleware.getByIdOrThrow,
    userController.userUnBan,
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

router.post(
    "/brand-models",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.BRAND_AND_MODELS_ADD),
    commonMiddleware.isBodyValid(BrandValidator.addBrandAndModel),
    brandController.addBrandAndModels,
);

router.delete(
    "/:userId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isIdValid("userId"),
    userMiddleware.getByIdOrThrow,
    userController.deleteById,
);
export const managementRouter = router;
