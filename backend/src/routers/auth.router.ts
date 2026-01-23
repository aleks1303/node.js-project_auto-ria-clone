import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.post(
    "/sign-up",
    commonMiddleware.isBodyValid(UserValidator.create),
    authController.signUp,
);
router.post(
    "/sign-in",
    commonMiddleware.isBodyValid(UserValidator.signIn),
    authController.signIn,
);
router.post(
    "/refresh",
    authMiddleware.checkRefreshToken,
    authController.refresh,
);
router.post(
    "/verify",
    commonMiddleware.isBodyValid(UserValidator.verify),
    authController.verify,
);
router.get("/verify/:token", authController.verifyEmail);

export const authRouter = router;
