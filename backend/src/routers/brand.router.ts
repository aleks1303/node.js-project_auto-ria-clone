import { Router } from "express";

import { brandController } from "../controllers/brand.controller";
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

export const brandRouter = router;
