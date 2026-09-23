import { Router } from "express";
import { systemController } from "../controllers/systemController.js";

const router = Router();

// GET /api/dashboard — uses Promise.all for concurrent independent queries
router.get("/", systemController.dashboard);

// GET /api/dashboard/external — uses Promise.allSettled; tolerates failures
router.get("/external", systemController.externalDashboard);

export default router;
