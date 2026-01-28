import { Router } from "express";

import { avatarConfig } from "../configs/avatar.config";
import { userController } from "../controllers/user.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { fileMiddleware } from "../middleware/file.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get(
    "/",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.USERS_GET_ALL),
    commonMiddleware.query(UserValidator.query),
    userController.getAll,
);
router.get("/me", authMiddleware.checkAccessToken, userController.getMe);

router.put(
    "/me",
    authMiddleware.checkAccessToken,
    commonMiddleware.isBodyValid(UserValidator.update),
    userController.updateMe,
);
router.post(
    "/me/avatar",
    authMiddleware.checkAccessToken,
    fileMiddleware.isFileValid("avatar", avatarConfig),
    userController.uploadAvatar,
);
router.delete(
    "/avatar",
    authMiddleware.checkAccessToken,
    userController.deleteAvatar,
);

router.get(
    "/:userId",
    authMiddleware.checkAccessToken,
    commonMiddleware.isIdValidate("userId"),
    userController.getById,
);

export const userRouter = router;
