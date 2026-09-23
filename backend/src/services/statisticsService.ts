import { statisticsRepository } from "../repositories/statisticsRepository.js";
import type {
  Statistics,
  CategoryStat,
  DifficultyStat,
  Question,
  Interview,
} from "../types/index.js";

export const statisticsService = {
  async getStatistics(): Promise<Statistics> {
    return statisticsRepository.getStatistics();
  },

  async getCategoryStats(minQuestions: number = 1): Promise<CategoryStat[]> {
    return statisticsRepository.getCategoryStats(minQuestions);
  },

  async getDifficultyStats(): Promise<DifficultyStat[]> {
    return statisticsRepository.getDifficultyStats();
  },

  async getUsersWithoutInterviews(): Promise<
    { id: number; name: string; email: string }[]
  > {
    return statisticsRepository.getUsersWithoutInterviews();
  },

  async getRecentQuestions(limit: number = 5): Promise<Question[]> {
    return statisticsRepository.getRecentQuestions(limit);
  },

  async getRecentInterviews(limit: number = 5): Promise<Interview[]> {
    return statisticsRepository.getRecentInterviews(limit);
  },

  async getRecentActivity(limit: number = 10): Promise<
    { type: string; description: string; title: string; title_es: string | null; created_at: string }[]
  > {
    return statisticsRepository.getRecentActivity(limit);
  },
};
