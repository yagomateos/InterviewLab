import { Router } from "express";
import { systemController } from "../controllers/systemController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/dashboard — your own progress + the shared question bank; uses
// Promise.all for concurrent independent queries. Requires auth since the
// "stats" portion is scoped to the logged-in user.
router.get("/", requireAuth, systemController.dashboard);

// GET /api/dashboard/external — uses Promise.allSettled; tolerates failures
router.get("/external", systemController.externalDashboard);

export default router;
