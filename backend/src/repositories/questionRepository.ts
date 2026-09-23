import { query } from "../config/db.js";
import type { Question } from "../types/index.js";

// All SQL lives in repositories — never in controllers or services.
// Every query uses parameterized placeholders ($1, $2, …) to prevent SQL injection.

export const questionRepository = {
  async findAll(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Question[]> {
    let sql = `
      SELECT q.id, q.category_id, c.name AS category_name,
             q.title, q.description, q.title_es, q.description_es,
             q.difficulty, q.created_at,
             COALESCE(
               (SELECT json_agg(json_build_object(
                  'id', o.id, 'question_id', o.question_id,
                  'text', o.text, 'text_es', o.text_es, 'is_correct', o.is_correct
                ) ORDER BY o.id)
                FROM question_options o WHERE o.question_id = q.id),
               '[]'
             ) AS options
      FROM questions q
      INNER JOIN categories c ON q.category_id = c.id
    `;
    const params: unknown[] = [];
    const conditions: string[] = [];

    // WHERE filters rows BEFORE any grouping — here we filter individual questions.
    if (filters?.category) {
      params.push(filters.category);
      conditions.push(`c.name = $${params.length}`);
    }
    if (filters?.difficulty) {
      params.push(filters.difficulty);
      conditions.push(`q.difficulty = $${params.length}`);
    }
    if (filters?.search) {
      params.push(`%${filters.search}%`);
      conditions.push(`q.title ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY q.created_at DESC`;
    return (await query<Question>(sql, params)).rows;
  },

  async findById(id: number): Promise<Question | null> {
    const sql = `
      SELECT q.id, q.category_id, c.name AS category_name,
             q.title, q.description, q.title_es, q.description_es,
             q.difficulty, q.created_at,
             COALESCE(
               (SELECT json_agg(json_build_object(
                  'id', o.id, 'question_id', o.question_id,
                  'text', o.text, 'text_es', o.text_es, 'is_correct', o.is_correct
                ) ORDER BY o.id)
                FROM question_options o WHERE o.question_id = q.id),
               '[]'
             ) AS options
      FROM questions q
      INNER JOIN categories c ON q.category_id = c.id
      WHERE q.id = $1
    `;
    const rows = (await query<Question>(sql, [id])).rows;
    return rows[0] ?? null;
  },

  async create(data: {
    category_id: number;
    title: string;
    description?: string;
    difficulty: string;
  }): Promise<Question> {
    const sql = `
      INSERT INTO questions (category_id, title, description, difficulty)
      VALUES ($1, $2, $3, $4)
      RETURNING id, category_id, title, description, difficulty, created_at
    `;
    return (await query<Question>(sql, [
      data.category_id,
      data.title,
      data.description ?? null,
      data.difficulty,
    ])).rows[0];
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
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (data.category_id !== undefined) {
      params.push(data.category_id);
      fields.push(`category_id = $${idx++}`);
    }
    if (data.title !== undefined) {
      params.push(data.title);
      fields.push(`title = $${idx++}`);
    }
    if (data.description !== undefined) {
      params.push(data.description);
      fields.push(`description = $${idx++}`);
    }
    if (data.difficulty !== undefined) {
      params.push(data.difficulty);
      fields.push(`difficulty = $${idx++}`);
    }

    if (fields.length === 0) return null;

    params.push(id);
    const sql = `
      UPDATE questions SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, category_id, title, description, difficulty, created_at
    `;
    const rows = (await query<Question>(sql, params)).rows;
    return rows[0] ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM questions WHERE id = $1`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
