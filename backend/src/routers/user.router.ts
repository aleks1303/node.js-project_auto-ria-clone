import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", userController.getAll);
router.get("/me", authMiddleware.checkAccessToken, userController.getMe);

export const userRouter = router;
