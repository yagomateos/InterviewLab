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
  async getStatistics(): Promise<Statistics> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM questions)   AS total_questions,
        (SELECT COUNT(*) FROM interviews)  AS total_interviews,
        (SELECT COUNT(*) FROM answers)     AS total_answers,
        (SELECT COUNT(*) FROM answers WHERE is_correct = true)  AS correct_answers,
        (SELECT COUNT(*) FROM answers WHERE is_correct = false) AS incorrect_answers
    `;
    const row = (await query<{
      total_questions: string;
      total_interviews: string;
      total_answers: string;
      correct_answers: string;
      incorrect_answers: string;
    }>(sql)).rows[0];

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

  // GROUP BY with HAVING — find categories that have MORE than a threshold
  // number of questions. HAVING filters groups AFTER aggregation,
  // whereas WHERE (used in the subquery) filters individual rows BEFORE grouping.
  async getCategoryStats(minQuestions: number = 1): Promise<CategoryStat[]> {
    const sql = `
      SELECT c.name AS category,
             COUNT(DISTINCT q.id) AS question_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = true)  AS correct_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = false) AS incorrect_count
      FROM categories c
      INNER JOIN questions q          ON q.category_id = c.id
      LEFT  JOIN interview_questions iq ON iq.question_id = q.id
      LEFT  JOIN answers a            ON a.interview_question_id = iq.id
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
    }>(sql, [minQuestions])).rows;

    return rows.map((r) => ({
      category: r.category,
      question_count: Number(r.question_count),
      correct_count: Number(r.correct_count),
      incorrect_count: Number(r.incorrect_count),
    }));
  },

  // GROUP BY difficulty with HAVING — stats per difficulty level.
  async getDifficultyStats(): Promise<DifficultyStat[]> {
    const sql = `
      SELECT q.difficulty,
             COUNT(DISTINCT q.id) AS question_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = true)  AS correct_count,
             COUNT(DISTINCT a.id) FILTER (WHERE a.is_correct = false) AS incorrect_count
      FROM questions q
      LEFT  JOIN interview_questions iq ON iq.question_id = q.id
      LEFT  JOIN answers a            ON a.interview_question_id = iq.id
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
    }>(sql)).rows;

    return rows.map((r) => ({
      difficulty: r.difficulty,
      question_count: Number(r.question_count),
      correct_count: Number(r.correct_count),
      incorrect_count: Number(r.incorrect_count),
    }));
  },

  // LEFT JOIN — find users who have NOT conducted any interviews.
  // INNER JOIN would exclude these users; LEFT JOIN preserves them with NULLs.
  async getUsersWithoutInterviews(): Promise<{ id: number; name: string; email: string }[]> {
    const sql = `
      SELECT u.id, u.name, u.email
      FROM users u
      LEFT JOIN interviews i ON i.user_id = u.id
      WHERE i.id IS NULL
      ORDER BY u.name
    `;
    return (await query<{ id: number; name: string; email: string }>(sql)).rows;
  },

  async getRecentActivity(limit: number = 10): Promise<
    { type: string; description: string; title: string; title_es: string | null; created_at: string }[]
  > {
    // description keeps the English "New question: <title>" form for
    // backward compatibility; title/title_es let the frontend rebuild a
    // localized version instead (see DashboardPage's formatActivity).
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
