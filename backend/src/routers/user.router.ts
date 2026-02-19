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
router.patch(
    "/me/premium",
    authMiddleware.checkAccessToken,
    userController.buyPremiumAccount,
);
router.patch(
    "/me/upgrade-seller",
    authMiddleware.checkAccessToken,
    userController.changeRoleToSeller,
);

router.patch(
    "/:userId/upgrade-role",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.USERS_UPDATE_ROLE),
    commonMiddleware.isBodyValid(UserValidator.upgradeRole),
    userController.upgradeUserRole,
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

router.post(
    "/manager",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.USERS_CREATE_MANAGER),
    commonMiddleware.isBodyValid(UserValidator.createManager),
    userController.createManager,
);

router.get(
    "/:userId",
    authMiddleware.checkAccessToken,
    commonMiddleware.isIdValid("userId"),
    userController.getById,
);
router.patch(
    "/:userId/ban",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.USERS_BAN),
    userController.userBan,
);

router.delete(
    "/:userId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.USERS_DELETE),
    userController.delete,
);

export const userRouter = router;
