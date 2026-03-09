import { Router } from "express";

import { adminController } from "../controllers/admin.controller";
import { userController } from "../controllers/user.controller";
import { PermissionsEnum } from "../enums/user-enum/permissions.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();
router.post(
    "/create",
    commonMiddleware.isBodyValid(UserValidator.createAdmin),
    adminController.createAdmin,
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
export const adminRouter = router;
