import type { Request, Response } from "express";
import { interviewService } from "../services/interviewService.js";
import { validateRequired } from "../middleware/errorHandler.js";

export const interviewController = {
  async getAll(_req: Request, res: Response) {
    const interviews = await interviewService.getAll();
    res.json(interviews);
  },

  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid interview ID" });
      return;
    }
    const interview = await interviewService.getById(id);
    if (!interview) {
      res.status(404).json({ error: "not_found", message: "Interview not found" });
      return;
    }
    const questions = await interviewService.getQuestions(id);
    res.json({ ...interview, questions });
  },

  async create(req: Request, res: Response) {
    validateRequired(req.body, ["user_id", "title"]);
    const interview = await interviewService.create({
      user_id: Number(req.body.user_id),
      title: String(req.body.title),
    });
    res.status(201).json(interview);
  },

  async addQuestion(req: Request, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    validateRequired(req.body, ["question_id"]);
    const iq = await interviewService.addQuestion(
      interviewId,
      Number(req.body.question_id)
    );
    if (!iq) {
      res.status(404).json({ error: "not_found", message: "Interview or question not found" });
      return;
    }
    res.status(201).json(iq);
  },

  async removeQuestion(req: Request, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    const questionId = parseInt(req.params.questionId, 10);
    const removed = await interviewService.removeQuestion(interviewId, questionId);
    if (!removed) {
      res.status(404).json({ error: "not_found", message: "Association not found" });
      return;
    }
    res.status(204).send();
  },

  async setAnswer(req: Request, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    const questionId = parseInt(req.params.questionId, 10);
    validateRequired(req.body, ["is_correct"]);
    try {
      const answer = await interviewService.setAnswer(
        interviewId,
        questionId,
        Boolean(req.body.is_correct),
        req.body.notes ? String(req.body.notes) : undefined
      );
      if (!answer) {
        res.status(404).json({ error: "not_found", message: "Interview question not found" });
        return;
      }
      res.json(answer);
    } catch (err) {
      res.status(400).json({ error: "bad_request", message: (err as Error).message });
    }
  },
};
