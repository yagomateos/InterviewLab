import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth.js";
import { statisticsService } from "../services/statisticsService.js";

export const statisticsController = {
  async getStatistics(req: AuthedRequest, res: Response) {
    const userId = req.userId!;
    const [stats, categoryStats, difficultyStats, usersWithoutInterviews] =
      await Promise.all([
        statisticsService.getStatistics(userId),
        statisticsService.getCategoryStats(userId, 1),
        statisticsService.getDifficultyStats(userId),
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
