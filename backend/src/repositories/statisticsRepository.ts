import { query } from "../config/db.js";
import type {
  Statistics,
  CategoryStat,
  DifficultyStat,
  Interview,
  Question,
  Category,
} from "../types/index.js";

export const statisticsRepository = {
  // total_questions is the shared question bank size (global, same for
  // everyone); everything else here is scoped to one user's own
  // interviews/answers via correlated subqueries, so two different users
  // never see each other's progress.
  async getStatistics(userId: number | null): Promise<Statistics> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM questions) AS total_questions,
        (SELECT COUNT(*) FROM interviews WHERE user_id = $1) AS total_interviews,
        (SELECT COUNT(*)
           FROM answers a
           INNER JOIN interview_questions iq ON iq.id = a.interview_question_id
           INNER JOIN interviews i           ON i.id = iq.interview_id
           WHERE i.user_id = $1)                                       AS total_answers,
        (SELECT COUNT(*)
           FROM answers a
           INNER JOIN interview_questions iq ON iq.id = a.interview_question_id
           INNER JOIN interviews i           ON i.id = iq.interview_id
           WHERE i.user_id = $1 AND a.is_correct = true)               AS correct_answers,
        (SELECT COUNT(*)
           FROM answers a
           INNER JOIN interview_questions iq ON iq.id = a.interview_question_id
           INNER JOIN interviews i           ON i.id = iq.interview_id
           WHERE i.user_id = $1 AND a.is_correct = false)              AS incorrect_answers
    `;
    const row = (await query<{
      total_questions: string;
      total_interviews: string;
      total_answers: string;
      correct_answers: string;
      incorrect_answers: string;
    }>(sql, [userId])).rows[0];

    const correct = Number(row.correct_answers);
    const total = Number(row.total_answers);
    const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total_questions: Number(row.total_questions),
      total_interviews: Number(row.total_interviews),
      total_answers: total,
      correct_answers: correct,
      incorrect_answers: Number(row.incorrect_answers),
      success_rate: successRate,
    };
  },

  // question_count is global (the bank's size per category); correct/incorrect
  // are scoped to the given user's own answers — a LEFT JOIN to interviews
  // that only resolves for that user's rows, so other users' answers never
  // reach the aggregate. HAVING filters groups AFTER aggregation, WHERE would
  // filter individual rows before grouping — HAVING is what we want here
  // since the threshold applies to the aggregated question_count.
  async getCategoryStats(minQuestions: number, userId: number): Promise<CategoryStat[]> {
    const sql = `
      SELECT c.name AS category,
             COUNT(DISTINCT q.id) AS question_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = true)  AS correct_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = false) AS incorrect_count
      FROM categories c
      INNER JOIN questions q            ON q.category_id = c.id
      LEFT  JOIN interview_questions iq ON iq.question_id = q.id
      LEFT  JOIN interviews i           ON i.id = iq.interview_id AND i.user_id = $2
      LEFT  JOIN answers a              ON a.interview_question_id = iq.id AND i.id IS NOT NULL
      WHERE q.difficulty IS NOT NULL
      GROUP BY c.name
      HAVING COUNT(DISTINCT q.id) >= $1
      ORDER BY question_count DESC
    `;
    const rows = (await query<{
      category: string;
      question_count: string;
      correct_count: string;
      incorrect_count: string;
    }>(sql, [minQuestions, userId])).rows;

    return rows.map((r) => ({
      category: r.category,
      question_count: Number(r.question_count),
      correct_count: Number(r.correct_count),
      incorrect_count: Number(r.incorrect_count),
    }));
  },

  // Same scoping approach as getCategoryStats, grouped by difficulty instead.
  async getDifficultyStats(userId: number): Promise<DifficultyStat[]> {
    const sql = `
      SELECT q.difficulty,
             COUNT(DISTINCT q.id) AS question_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = true)  AS correct_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = false) AS incorrect_count
      FROM questions q
      LEFT  JOIN interview_questions iq ON iq.question_id = q.id
      LEFT  JOIN interviews i           ON i.id = iq.interview_id AND i.user_id = $1
      LEFT  JOIN answers a              ON a.interview_question_id = iq.id AND i.id IS NOT NULL
      GROUP BY q.difficulty
      HAVING COUNT(DISTINCT q.id) > 0
      ORDER BY
        CASE q.difficulty
          WHEN 'easy' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'hard' THEN 3
        END
    `;
    const rows = (await query<{
      difficulty: string;
      question_count: string;
      correct_count: string;
      incorrect_count: string;
    }>(sql, [userId])).rows;

    return rows.map((r) => ({
      difficulty: r.difficulty,
      question_count: Number(r.question_count),
      correct_count: Number(r.correct_count),
      incorrect_count: Number(r.incorrect_count),
    }));
  },

  // LEFT JOIN — find users who have NOT conducted any interviews. This is a
  // global, app-wide view (not scoped to the caller) used purely to
  // demonstrate LEFT JOIN; only id/name are returned (no email) to avoid
  // exposing other accounts' contact info now that real users can sign up.
  async getUsersWithoutInterviews(): Promise<{ id: number; name: string }[]> {
    const sql = `
      SELECT u.id, u.name
      FROM users u
      LEFT JOIN interviews i ON i.user_id = u.id
      WHERE i.id IS NULL
      ORDER BY u.name
    `;
    return (await query<{ id: number; name: string }>(sql)).rows;
  },

  async getRecentActivity(limit: number = 10): Promise<
    { type: string; description: string; title: string; title_es: string | null; created_at: string }[]
  > {
    // description keeps the English "New question: <title>" form for
    // backward compatibility; title/title_es let the frontend rebuild a
    // localized version instead (see DashboardPage's formatActivity).
    // This feed is the shared question bank's newest additions — global,
    // not a personal activity log (there's no per-user event history).
    const sql = `
      SELECT 'question' AS type,
             'New question: ' || title AS description,
             title, title_es,
             created_at
      FROM questions
      ORDER BY created_at DESC
      LIMIT $1
    `;
    return (
      await query<{ type: string; description: string; title: string; title_es: string | null; created_at: string }>(
        sql,
        [limit]
      )
    ).rows;
  },

  async getRecentQuestions(limit: number = 5): Promise<Question[]> {
    const sql = `
      SELECT q.id, q.category_id, c.name AS category_name,
             q.title, q.description, q.title_es, q.description_es,
             q.difficulty, q.created_at
      FROM questions q
      INNER JOIN categories c ON q.category_id = c.id
      ORDER BY q.created_at DESC
      LIMIT $1
    `;
    return (await query<Question>(sql, [limit])).rows;
  },

  async getRecentInterviews(limit: number = 5): Promise<Interview[]> {
    const sql = `
      SELECT i.id, i.user_id, u.name AS user_name,
             i.title, i.status, i.created_at
      FROM interviews i
      INNER JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
      LIMIT $1
    `;
    return (await query<Interview>(sql, [limit])).rows;
  },
};
