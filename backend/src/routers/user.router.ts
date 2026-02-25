import { Router } from "express";

import { avatarConfig } from "../configs/avatar.config";
import { userController } from "../controllers/user.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { fileMiddleware } from "../middleware/file.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get(
    "/",
    authMiddleware.checkAccessToken,
    authMiddleware.checkPermission(PermissionsEnum.USERS_GET_ALL),
    commonMiddleware.query(UserValidator.query),
    userController.getAll,
);
router.get(
    "/me",
    authMiddleware.checkAccessToken,
    userMiddleware.getMeOrThrow,
    userController.getMe,
);

router.put(
    "/me",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    commonMiddleware.isBodyValid(UserValidator.update),
    userController.updateMe,
);
router.patch(
    "/me/premium",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userMiddleware.getMeOrThrow,
    userController.buyPremiumAccount,
);
router.patch(
    "/me/upgrade-seller",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userMiddleware.getMeOrThrow,
    userController.changeRoleToSeller,
);
router.post(
    "/me/avatar",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    fileMiddleware.isFileValid("avatar", avatarConfig),
    userMiddleware.getMeOrThrow,
    userController.uploadAvatar,
);

router.delete(
    "/avatar",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    userMiddleware.getMeOrThrow,
    userController.deleteAvatar,
);

router.post(
    "/manager",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.USERS_CREATE_MANAGER),
    commonMiddleware.isBodyValid(UserValidator.createManager),
    userController.createManager,
);

router.patch(
    "/:userId/upgrade-role",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.USERS_UPDATE_ROLE),
    commonMiddleware.isIdValid("userId"),
    commonMiddleware.isBodyValid(UserValidator.upgradeRole),
    userMiddleware.getByIdOrThrow,
    userController.upgradeUserRole,
);

router.get(
    "/:userId",
    authMiddleware.checkAccessToken,
    commonMiddleware.isIdValid("userId"),
    userMiddleware.getByIdOrThrow,
    userController.getById,
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

router.delete(
    "/:userId",
    authMiddleware.checkAccessToken,
    authMiddleware.checkIsVerified,
    authMiddleware.checkPermission(PermissionsEnum.USERS_DELETE),
    commonMiddleware.isIdValid("userId"),
    userMiddleware.getByIdOrThrow,
    userController.delete,
);

export const userRouter = router;
