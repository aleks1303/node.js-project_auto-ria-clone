import { Router } from "express";

import { avatarConfig } from "../configs/avatar.config";
import { userController } from "../controllers/user.controller";
import { RoleEnum } from "../enums/role.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { fileMiddleware } from "../middleware/file.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get(
    "/",
    authMiddleware.checkAccessToken,
    authMiddleware.checkRole([RoleEnum.SELLER]),
    commonMiddleware.query(UserValidator.query),
    userController.getAll,
);
router.get("/me", authMiddleware.checkAccessToken, userController.getMe);
router.post(
    "/me/avatar",
    authMiddleware.checkAccessToken,
    fileMiddleware.isFileValid("avatar", avatarConfig),
    userController.uploadAvatar,
);

export const userRouter = router;
