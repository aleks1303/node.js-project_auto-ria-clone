import { Router } from "express";

import { adminRouter } from "./admin.router";
import { authRouter } from "./auth.router";
import { brandRouter } from "./brand.router";
import { carRouter } from "./car.router";
import { managementRouter } from "./management.router";
import { userRouter } from "./user.router";

const router = Router();

router.use("/admin", adminRouter);
router.use("/management", managementRouter);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/cars", carRouter);
router.use("/brands", brandRouter);

export const apiRouter = router;
