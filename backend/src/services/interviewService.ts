import { interviewRepository } from "../repositories/interviewRepository.js";
import type { Interview, InterviewQuestion, Answer } from "../types/index.js";

export const interviewService = {
  async getAll(): Promise<Interview[]> {
    return interviewRepository.findAll();
  },

  async getById(id: number): Promise<Interview | null> {
    return interviewRepository.findById(id);
  },

  async create(data: { user_id: number; title: string }): Promise<Interview> {
    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }
    return interviewRepository.create(data);
  },

  async getQuestions(interviewId: number): Promise<InterviewQuestion[]> {
    return interviewRepository.getQuestions(interviewId);
  },

  async addQuestion(
    interviewId: number,
    questionId: number
  ): Promise<InterviewQuestion | null> {
    return interviewRepository.addQuestion(interviewId, questionId);
  },

  async removeQuestion(
    interviewId: number,
    questionId: number
  ): Promise<boolean> {
    return interviewRepository.removeQuestion(interviewId, questionId);
  },

  async setAnswer(
    interviewId: number,
    questionId: number,
    isCorrect: boolean,
    notes?: string
  ): Promise<Answer | null> {
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
