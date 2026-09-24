import { Router } from "express";
import { interviewController } from "../controllers/interviewController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Every interview belongs to a user — all routes here require a valid session.
router.use(requireAuth);

router.get("/", interviewController.getAll);
router.get("/:id", interviewController.getById);
router.post("/", interviewController.create);
router.post("/:id/questions", interviewController.addQuestion);
router.delete("/:id/questions/:questionId", interviewController.removeQuestion);
router.put("/:id/questions/:questionId/answer", interviewController.setAnswer);
router.put("/:id/status", interviewController.updateStatus);

export default router;
