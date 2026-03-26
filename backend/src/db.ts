// PostgreSQL connection pool and table initialisation.

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Creates the holdings table if it doesn't already exist. Called once at server startup.
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS holdings (
      id              SERIAL PRIMARY KEY,
      ticker          VARCHAR(20) UNIQUE NOT NULL,
      shares          NUMERIC       NOT NULL,
      amount_invested NUMERIC       NOT NULL
    )
  `);
}
