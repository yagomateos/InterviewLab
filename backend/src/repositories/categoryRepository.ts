import { query } from "../config/db.js";
import type { Category } from "../types/index.js";

export const categoryRepository = {
  async findAll(): Promise<Category[]> {
    const sql = `SELECT id, name FROM categories ORDER BY name`;
    return (await query<Category>(sql)).rows;
  },

  async findByName(name: string): Promise<Category | null> {
    const sql = `SELECT id, name FROM categories WHERE name = $1`;
    const rows = (await query<Category>(sql, [name])).rows;
    return rows[0] ?? null;
  },
};
