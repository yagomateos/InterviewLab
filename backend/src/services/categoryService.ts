import { categoryRepository } from "../repositories/categoryRepository.js";
import type { Category } from "../types/index.js";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return categoryRepository.findAll();
  },
};
