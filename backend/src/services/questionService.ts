import { questionRepository } from "../repositories/questionRepository.js";
import type { Question } from "../types/index.js";

export const questionService = {
  async getAll(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Question[]> {
    return questionRepository.findAll(filters);
  },

  async getById(id: number): Promise<Question | null> {
    return questionRepository.findById(id);
  },

  async create(data: {
    category_id: number;
    title: string;
    description?: string;
    difficulty: string;
  }): Promise<Question> {
    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }
    if (!data.category_id) {
      throw new Error("Category is required");
    }
    return questionRepository.create(data);
  },

  async update(
    id: number,
    data: Partial<{
      category_id: number;
      title: string;
      description: string;
      difficulty: string;
    }>
  ): Promise<Question | null> {
    return questionRepository.update(id, data);
  },

  async delete(id: number): Promise<boolean> {
    return questionRepository.delete(id);
  },
};
