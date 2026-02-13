import { Router } from "express";

import { brandController } from "../controllers/brand.controller";

const router = Router();

router.get("/", brandController.getAll);

export const brandRouter = router;
