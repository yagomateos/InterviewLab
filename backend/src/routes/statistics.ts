import { Router } from "express";
import { statisticsController } from "../controllers/statisticsController.js";

const router = Router();

router.get("/", statisticsController.getStatistics);

export default router;
