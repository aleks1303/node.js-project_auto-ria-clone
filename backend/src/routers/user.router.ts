import { Router } from "express";

import { userController } from "../controllers/user.controller";

const router = Router();

router.use("/", userController.getAll);

export const userRouter = router;
