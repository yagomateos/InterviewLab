import pg from "pg";

const { Pool } = pg;

// In production (Vercel + Neon) the pooled connection string is provided as
// DATABASE_URL and requires SSL. Locally (docker compose) we fall back to
// the discrete DB_* variables with no SSL.
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      user: process.env.DB_USER || "interviewlab",
      password: process.env.DB_PASSWORD || "interviewlab_pass",
      database: process.env.DB_NAME || "interviewlab",
    });

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params as pg.QueryArrayConfig["values"]);
}
