import { Router } from "express";

import { brandController } from "../controllers/brand.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { BrandValidator } from "../validators/brand.validator";

const router = Router();

router.get("/", brandController.getAll);

router.post(
    "/report",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isBodyValid(BrandValidator.report),
    brandController.missingBrand,
);
router.post(
    "/brand-models",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.BRAND_AND_MODELS_ADD),
    commonMiddleware.isBodyValid(BrandValidator.addBrandAndModel),
    brandController.addBrandAndModels,
);

export const brandRouter = router;
