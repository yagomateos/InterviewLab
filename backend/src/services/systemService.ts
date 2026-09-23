// ============================================================
// System Service — demonstrates Node.js Event Loop & async patterns
// ============================================================

// simulateExternalService: mimics a slow I/O operation (e.g. calling a
// remote API). The callback is scheduled via the Event Loop using setImmediate,
// which fires after the current poll phase completes — proving the operation
// does NOT block the main thread.
export function simulateExternalService(delay: number = 100): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`Completed after ${delay}ms`), delay);
  });
}

// A deliberately failing service — used to demonstrate Promise.allSettled
// (the endpoint should still return data even when this rejects).
export function failingService(): Promise<string> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("External difficulty service unavailable")), 200);
  });
}

// Run several async operations and report the order in which they resolve.
// Because setTimeout callbacks are queued on the Event Loop (timers phase),
// the results illustrate that the main thread is NOT blocked while waiting.
export async function runAsyncDemo() {
  const start = Date.now();

  const operations = [
    { name: "fast-query",   delay: 50 },
    { name: "slow-query",   delay: 200 },
    { name: "cache-read",   delay: 10 },
    { name: "external-api", delay: 150 },
  ];

  const results = await Promise.all(
    operations.map(async (op) => {
      const result = await simulateExternalService(op.delay);
      return {
        name: op.name,
        delay: op.delay,
        result,
        elapsedMs: Date.now() - start,
      };
    })
  );

  return {
    totalElapsedMs: Date.now() - start,
    operations: results.sort((a, b) => a.elapsedMs - b.elapsedMs),
    explanation:
      "All four operations ran concurrently. If they were sequential " +
      "the total time would be 410ms (50+200+10+150). With Promise.all " +
      "they overlap, so the total is ~200ms — the slowest operation.",
  };
}

// Dashboard using Promise.all — all queries are independent so they
// can run concurrently.
export async function getDashboardData() {
  // These four calls have NO dependency on each other, so Promise.all
  // runs them concurrently rather than awaiting one-by-one.
  const { statisticsService } = await import("./statisticsService.js");
  const { categoryService } = await import("./categoryService.js");

  const [stats, recentQuestions, categories, recentActivity] = await Promise.all([
    statisticsService.getStatistics(),
    statisticsService.getRecentQuestions(5),
    categoryService.getAll(),
    statisticsService.getRecentActivity(10),
  ]);

  return { stats, recentQuestions, categories, recentActivity };
}

// External dashboard using Promise.allSettled — some services may fail,
// but we still return whatever succeeded.
export async function getExternalDashboardData() {
  const { statisticsService } = await import("./statisticsService.js");

  const [
    questionsResult,
    statsResult,
    recommendationsResult,
    difficultyResult,
  ] = await Promise.allSettled([
    // Service 1: questions — succeeds
    simulateExternalService(80).then(() =>
      statisticsService.getRecentQuestions(5)
    ),
    // Service 2: statistics — succeeds
    simulateExternalService(100).then(() =>
      statisticsService.getStatistics()
    ),
    // Service 3: recommendations — succeeds
    simulateExternalService(60).then(() => [
      "Review Docker networking",
      "Practice Promise.all vs allSettled",
      "Study SQL JOINs",
    ]),
    // Service 4: external difficulty service — FAILS intentionally
    failingService(),
  ]);

  return {
    services: [
      {
        name: "questions-service",
        status: questionsResult.status,
        data: questionsResult.status === "fulfilled" ? questionsResult.value : null,
        error: questionsResult.status === "rejected" ? String(questionsResult.reason) : null,
      },
      {
        name: "statistics-service",
        status: statsResult.status,
        data: statsResult.status === "fulfilled" ? statsResult.value : null,
        error: statsResult.status === "rejected" ? String(statsResult.reason) : null,
      },
      {
        name: "recommendations-service",
        status: recommendationsResult.status,
        data: recommendationsResult.status === "fulfilled" ? recommendationsResult.value : null,
        error: recommendationsResult.status === "rejected" ? String(recommendationsResult.reason) : null,
      },
      {
        name: "difficulty-service",
        status: difficultyResult.status,
        data: difficultyResult.status === "fulfilled" ? difficultyResult.value : null,
        error: difficultyResult.status === "rejected" ? String(difficultyResult.reason) : null,
      },
    ],
  };
}
