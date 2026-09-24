// ============================================================
// System Service
// ============================================================

// Dashboard using Promise.all — all queries are independent so they
// can run concurrently. `stats` is scoped to userId (your own progress);
// recentQuestions/categories/recentActivity are the shared question bank
// and stay the same for everyone.
export async function getDashboardData(userId: number) {
  // These four calls have NO dependency on each other, so Promise.all
  // runs them concurrently rather than awaiting one-by-one.
  const { statisticsService } = await import("./statisticsService.js");
  const { categoryService } = await import("./categoryService.js");

  const [stats, recentQuestions, categories, recentActivity] = await Promise.all([
    statisticsService.getStatistics(userId),
    statisticsService.getRecentQuestions(5),
    categoryService.getAll(),
    statisticsService.getRecentActivity(10),
  ]);

  return { stats, recentQuestions, categories, recentActivity };
}
