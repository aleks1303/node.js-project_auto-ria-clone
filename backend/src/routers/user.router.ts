import { Router } from "express";

import { avatarConfig } from "../configs/avatar.config";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { fileMiddleware } from "../middleware/file.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get("/me", authMiddleware.checkAccessToken, userController.getMe);

router.put(
    "/me",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isBodyValid(UserValidator.update),
    userController.updateMe,
);

router.delete(
    "/me",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userController.deleteMe,
);

router.patch(
    "/me/premium",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userController.buyPremiumAccount,
);
router.patch(
    "/me/upgrade-seller",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userController.changeRoleToSeller,
);
router.post(
    "/me/avatar",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    fileMiddleware.isFileValid("avatar", avatarConfig),
    userController.uploadAvatar,
);

router.delete(
    "/avatar",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userController.deleteAvatar,
);

router.get(
    "/:userId",
    authMiddleware.checkAccessToken,
    commonMiddleware.isIdValid("userId"),
    userMiddleware.getByIdOrThrow,
    userController.getById,
);

export const userRouter = router;
