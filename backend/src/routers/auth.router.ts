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
    "/verify-email",
    commonMiddleware.isBodyValid(UserValidator.verify),
    authController.verifyEmail,
);
router.get("/verify/:token", authController.verifyTokenFromEmail);

router.post(
    "/forgot-password",
    commonMiddleware.isBodyValid(UserValidator.verify),
    authController.forgotPasswordSendEmail,
);
router.put(
    "/forgot-password",
    authMiddleware.checkActionToken,
    commonMiddleware.isBodyValid(UserValidator.setForgotPassword),
    authController.forgotPasswordSet,
);

router.post("/logout", authMiddleware.checkRefreshToken, authController.logout);

export const authRouter = router;
