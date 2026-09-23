import type { Request, Response } from "express";
import { questionService } from "../services/questionService.js";
import { validateRequired } from "../middleware/errorHandler.js";

export const questionController = {
  async getAll(req: Request, res: Response) {
    const filters = {
      category: req.query.category as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      search: req.query.search as string | undefined,
    };
    const questions = await questionService.getAll(filters);
    res.json(questions);
  },

  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid question ID" });
      return;
    }
    const question = await questionService.getById(id);
    if (!question) {
      res.status(404).json({ error: "not_found", message: "Question not found" });
      return;
    }
    res.json(question);
  },

  async create(req: Request, res: Response) {
    validateRequired(req.body, ["category_id", "title", "difficulty"]);
    const question = await questionService.create({
      category_id: Number(req.body.category_id),
      title: String(req.body.title),
      description: req.body.description ? String(req.body.description) : undefined,
      difficulty: String(req.body.difficulty),
    });
    res.status(201).json(question);
  },

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid question ID" });
      return;
    }
    const question = await questionService.update(id, {
      category_id: req.body.category_id !== undefined ? Number(req.body.category_id) : undefined,
      title: req.body.title !== undefined ? String(req.body.title) : undefined,
      description: req.body.description !== undefined ? String(req.body.description) : undefined,
      difficulty: req.body.difficulty !== undefined ? String(req.body.difficulty) : undefined,
    });
    if (!question) {
      res.status(404).json({ error: "not_found", message: "Question not found" });
      return;
    }
    res.json(question);
  },

  async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid question ID" });
      return;
    }
    const deleted = await questionService.delete(id);
    if (!deleted) {
      res.status(404).json({ error: "not_found", message: "Question not found" });
      return;
    }
    res.status(204).send();
  },
};
