import { Router } from "express";
import { statisticsController } from "../controllers/statisticsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Statistics are personal progress data, scoped to the logged-in user.
router.get("/", requireAuth, statisticsController.getStatistics);

export default router;
