import { Router } from "express";
import { systemController } from "../controllers/systemController.js";

const router = Router();

// GET /api/system/async-demo — demonstrates Event Loop + concurrent async ops
router.get("/async-demo", systemController.asyncDemo);

export default router;
