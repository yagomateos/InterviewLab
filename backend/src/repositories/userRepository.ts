import { query } from "../config/db.js";
import type { User } from "../types/index.js";

// Internal shape that includes the password hash — never sent to clients.
// Public responses always use the plain `User` type instead.
export interface UserWithPassword extends User {
  password_hash: string;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const sql = `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = $1
    `;
    const rows = (await query<UserWithPassword>(sql, [email])).rows;
    return rows[0] ?? null;
  },

  async findById(id: number): Promise<User | null> {
    const sql = `SELECT id, name, email, created_at FROM users WHERE id = $1`;
    const rows = (await query<User>(sql, [id])).rows;
    return rows[0] ?? null;
  },

  async create(data: {
    name: string;
    email: string;
    password_hash: string;
  }): Promise<User> {
    const sql = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    return (
      await query<User>(sql, [data.name, data.email, data.password_hash])
    ).rows[0];
  },
};
