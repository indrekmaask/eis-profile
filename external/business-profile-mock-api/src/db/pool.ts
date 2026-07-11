import pg from "pg";
import { getConfig } from "../config/env.js";

const { Pool, types } = pg;

const PG_OID = {
  INT8: 20,
  NUMERIC: 1700,
  DATE: 1082,
  TIMESTAMPTZ: 1184,
} as const;

types.setTypeParser(PG_OID.INT8, (value) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`BIGINT value ${value} exceeds Number.MAX_SAFE_INTEGER`);
  }
  return parsed;
});

types.setTypeParser(PG_OID.NUMERIC, (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid NUMERIC value from database: ${value}`);
  }
  return parsed;
});

types.setTypeParser(PG_OID.DATE, (value) => value);

types.setTypeParser(PG_OID.TIMESTAMPTZ, (value) => new Date(value).toISOString());

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getConfig().databaseUrl,
    });

    pool.on("connect", (client) => {
      client.query("SET search_path TO business_registry, public").catch((error) => {
        console.error("Failed to set search_path on new connection:", error);
      });
    });

    pool.on("error", (error) => {
      console.error("Idle pg client error:", error);
    });
  }

  return pool;
}

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
