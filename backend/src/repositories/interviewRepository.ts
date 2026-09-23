import { query } from "../config/db.js";
import type { Interview, InterviewQuestion, Answer } from "../types/index.js";

export const interviewRepository = {
  // Scoped to one user — each account only ever sees its own interviews.
  async findAllByUser(userId: number): Promise<Interview[]> {
    // INNER JOIN — only interviews that have a matching user appear.
    // LEFT JOIN on interview_questions + COUNT gives us question_count,
    // including interviews with zero questions (LEFT JOIN preserves them).
    const sql = `
      SELECT i.id, i.user_id, u.name AS user_name,
             i.title, i.status, i.created_at,
             COUNT(iq.id) AS question_count
      FROM interviews i
      INNER JOIN users u ON i.user_id = u.id
      LEFT JOIN interview_questions iq ON iq.interview_id = i.id
      WHERE i.user_id = $1
      GROUP BY i.id, u.name
      ORDER BY i.created_at DESC
    `;
    const rows = (await query<Interview>(sql, [userId])).rows;
    return rows.map((r) => ({
      ...r,
      question_count: Number(r.question_count),
    }));
  },

  async findById(id: number): Promise<Interview | null> {
    const sql = `
      SELECT i.id, i.user_id, u.name AS user_name,
             i.title, i.status, i.created_at
      FROM interviews i
      INNER JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `;
    const rows = (await query<Interview>(sql, [id])).rows;
    return rows[0] ?? null;
  },

  async create(data: { user_id: number; title: string }): Promise<Interview> {
    const sql = `
      INSERT INTO interviews (user_id, title, status)
      VALUES ($1, $2, 'scheduled')
      RETURNING id, user_id, title, status, created_at
    `;
    return (await query<Interview>(sql, [data.user_id, data.title])).rows[0];
  },

  async updateStatus(id: number, status: string): Promise<Interview | null> {
    const sql = `
      UPDATE interviews SET status = $1 WHERE id = $2
      RETURNING id, user_id, title, status, created_at
    `;
    const rows = (await query<Interview>(sql, [status, id])).rows;
    return rows[0] ?? null;
  },

  // Questions associated with an interview — INNER JOIN across
  // interview_questions → questions → categories.
  async getQuestions(interviewId: number): Promise<InterviewQuestion[]> {
    const sql = `
      SELECT iq.id, iq.interview_id, iq.question_id, iq."order",
             q.title, c.name AS category_name, q.difficulty,
             a.is_correct
      FROM interview_questions iq
      INNER JOIN questions q  ON iq.question_id = q.id
      INNER JOIN categories c ON q.category_id = c.id
      LEFT JOIN answers a     ON a.interview_question_id = iq.id
      WHERE iq.interview_id = $1
      ORDER BY iq."order"
    `;
    return (await query<InterviewQuestion>(sql, [interviewId])).rows;
  },

  async addQuestion(
    interviewId: number,
    questionId: number
  ): Promise<InterviewQuestion | null> {
    // Determine the next order value
    const orderSql = `SELECT COALESCE(MAX("order"), 0) + 1 AS next_order FROM interview_questions WHERE interview_id = $1`;
    const orderResult = await query<{ next_order: number }>(orderSql, [interviewId]);
    const nextOrder = Number(orderResult.rows[0].next_order);

    const sql = `
      INSERT INTO interview_questions (interview_id, question_id, "order")
      VALUES ($1, $2, $3)
      RETURNING id, interview_id, question_id, "order"
    `;
    const rows = (await query<InterviewQuestion>(sql, [
      interviewId,
      questionId,
      nextOrder,
    ])).rows;
    return rows[0] ?? null;
  },

  async removeQuestion(
    interviewId: number,
    questionId: number
  ): Promise<boolean> {
    const sql = `DELETE FROM interview_questions WHERE interview_id = $1 AND question_id = $2`;
    const result = await query(sql, [interviewId, questionId]);
    return (result.rowCount ?? 0) > 0;
  },

  // Mark a question as correct/incorrect within an interview.
  async setAnswer(
    interviewQuestionId: number,
    isCorrect: boolean,
    notes?: string
  ): Promise<Answer | null> {
    // Upsert: if an answer exists, update it; otherwise insert.
    const sql = `
      INSERT INTO answers (interview_question_id, is_correct, notes)
      VALUES ($1, $2, $3)
      ON CONFLICT (interview_question_id)
      DO UPDATE SET is_correct = $2, notes = $3
      RETURNING id, interview_question_id, is_correct, notes, created_at
    `;
    const rows = (await query<Answer>(sql, [
      interviewQuestionId,
      isCorrect,
      notes ?? null,
    ])).rows;
    return rows[0] ?? null;
  },

  async findInterviewQuestion(
    interviewId: number,
    questionId: number
  ): Promise<InterviewQuestion | null> {
    const sql = `
      SELECT id, interview_id, question_id, "order"
      FROM interview_questions
      WHERE interview_id = $1 AND question_id = $2
    `;
    const rows = (await query<InterviewQuestion>(sql, [interviewId, questionId])).rows;
    return rows[0] ?? null;
  },
};
