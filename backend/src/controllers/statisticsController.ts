import type { Request, Response } from "express";
import { statisticsService } from "../services/statisticsService.js";

export const statisticsController = {
  async getStatistics(_req: Request, res: Response) {
    const [stats, categoryStats, difficultyStats, usersWithoutInterviews] =
      await Promise.all([
        statisticsService.getStatistics(),
        statisticsService.getCategoryStats(1),
        statisticsService.getDifficultyStats(),
        statisticsService.getUsersWithoutInterviews(),
      ]);
    res.json({
      ...stats,
      by_category: categoryStats,
      by_difficulty: difficultyStats,
      users_without_interviews: usersWithoutInterviews,
    });
  },
};
