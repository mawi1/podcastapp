import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { findUpSync } from "find-up";
import pg from "pg";

import * as schema from "./schema";

dotenv.config({ path: findUpSync(".env") });

function getPort(): number {
  const p = process.env.DB_PORT;
  if (p === undefined || p === null) {
    return 5432;
  }
  return parseInt(p);
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: getPort(),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === "development" });

export default db;
