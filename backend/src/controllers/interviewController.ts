import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth.js";
import { interviewService } from "../services/interviewService.js";
import { validateRequired } from "../middleware/errorHandler.js";

// Every handler here runs behind requireAuth (see routes/interviews.ts), so
// req.userId is always set — the `!` assertions below reflect that.
export const interviewController = {
  async getAll(req: AuthedRequest, res: Response) {
    const interviews = await interviewService.getAll(req.userId!);
    res.json(interviews);
  },

  async getById(req: AuthedRequest, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid interview ID" });
      return;
    }
    const interview = await interviewService.getById(id, req.userId!);
    if (!interview) {
      res.status(404).json({ error: "not_found", message: "Interview not found" });
      return;
    }
    const questions = await interviewService.getQuestions(id);
    res.json({ ...interview, questions });
  },

  async create(req: AuthedRequest, res: Response) {
    validateRequired(req.body, ["title"]);
    const interview = await interviewService.create(
      { title: String(req.body.title) },
      req.userId!
    );
    res.status(201).json(interview);
  },

  async addQuestion(req: AuthedRequest, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    validateRequired(req.body, ["question_id"]);
    const iq = await interviewService.addQuestion(
      interviewId,
      Number(req.body.question_id),
      req.userId!
    );
    if (!iq) {
      res.status(404).json({ error: "not_found", message: "Interview or question not found" });
      return;
    }
    res.status(201).json(iq);
  },

  async removeQuestion(req: AuthedRequest, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    const questionId = parseInt(req.params.questionId, 10);
    const removed = await interviewService.removeQuestion(
      interviewId,
      questionId,
      req.userId!
    );
    if (!removed) {
      res.status(404).json({ error: "not_found", message: "Association not found" });
      return;
    }
    res.status(204).send();
  },

  async setAnswer(req: AuthedRequest, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    const questionId = parseInt(req.params.questionId, 10);
    validateRequired(req.body, ["is_correct"]);
    try {
      const answer = await interviewService.setAnswer(
        interviewId,
        questionId,
        Boolean(req.body.is_correct),
        req.userId!,
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

  async updateStatus(req: AuthedRequest, res: Response) {
    const interviewId = parseInt(req.params.id, 10);
    validateRequired(req.body, ["status"]);
    try {
      const interview = await interviewService.updateStatus(
        interviewId,
        String(req.body.status),
        req.userId!
      );
      if (!interview) {
        res.status(404).json({ error: "not_found", message: "Interview not found" });
        return;
      }
      res.json(interview);
    } catch (err) {
      res.status(400).json({ error: "bad_request", message: (err as Error).message });
    }
  },
};
