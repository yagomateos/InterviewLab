import { Router } from "express";
import { interviewController } from "../controllers/interviewController.js";

const router = Router();

router.get("/", interviewController.getAll);
router.get("/:id", interviewController.getById);
router.post("/", interviewController.create);
router.post("/:id/questions", interviewController.addQuestion);
router.delete("/:id/questions/:questionId", interviewController.removeQuestion);
router.put("/:id/questions/:questionId/answer", interviewController.setAnswer);

export default router;
