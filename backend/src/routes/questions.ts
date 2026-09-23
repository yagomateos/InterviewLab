import { Router } from "express";
import { questionController } from "../controllers/questionController.js";

const router = Router();

router.get("/", questionController.getAll);
router.get("/:id", questionController.getById);
router.post("/", questionController.create);
router.put("/:id", questionController.update);
router.delete("/:id", questionController.remove);

export default router;
