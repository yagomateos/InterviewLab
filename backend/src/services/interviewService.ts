import { interviewRepository } from "../repositories/interviewRepository.js";
import type { Interview, InterviewQuestion, Answer } from "../types/index.js";

export const interviewService = {
  async getAll(userId: number): Promise<Interview[]> {
    return interviewRepository.findAllByUser(userId);
  },

  // Ownership check lives here: an interview is only ever returned to the
  // user who owns it, so every other method below that needs an interview
  // ID goes through this first.
  async getById(id: number, userId: number): Promise<Interview | null> {
    const interview = await interviewRepository.findById(id);
    if (!interview || interview.user_id !== userId) return null;
    return interview;
  },

  async create(data: { title: string }, userId: number): Promise<Interview> {
    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }
    return interviewRepository.create({ user_id: userId, title: data.title });
  },

  async getQuestions(interviewId: number): Promise<InterviewQuestion[]> {
    return interviewRepository.getQuestions(interviewId);
  },

  async addQuestion(
    interviewId: number,
    questionId: number,
    userId: number
  ): Promise<InterviewQuestion | null> {
    const owned = await interviewService.getById(interviewId, userId);
    if (!owned) return null;
    return interviewRepository.addQuestion(interviewId, questionId);
  },

  async removeQuestion(
    interviewId: number,
    questionId: number,
    userId: number
  ): Promise<boolean> {
    const owned = await interviewService.getById(interviewId, userId);
    if (!owned) return false;
    return interviewRepository.removeQuestion(interviewId, questionId);
  },

  async setAnswer(
    interviewId: number,
    questionId: number,
    isCorrect: boolean,
    userId: number,
    notes?: string
  ): Promise<Answer | null> {
    const owned = await interviewService.getById(interviewId, userId);
    if (!owned) return null;

    const iq = await interviewRepository.findInterviewQuestion(
      interviewId,
      questionId
    );
    if (!iq) {
      throw new Error("Question is not part of this interview");
    }
    return interviewRepository.setAnswer(iq.id, isCorrect, notes);
  },
};
