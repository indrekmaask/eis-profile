import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, query } from "./pool.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

async function applySqlFiles(kind: "migration" | "seed", directoryName: string): Promise<void> {
  const directoryPath = path.join(currentDir, directoryName);

  await query(`
    CREATE TABLE IF NOT EXISTS schema_history (
      id BIGSERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (kind, name)
    )
  `);

  if (!fs.existsSync(directoryPath)) {
    throw new Error(`SQL directory not found: ${directoryPath}`);
  }

  const files = fs
    .readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  for (const fileName of files) {
    const alreadyApplied = await query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM schema_history WHERE kind = $1 AND name = $2)",
      [kind, fileName]
    );

    if (alreadyApplied.rows[0]?.exists) {
      continue;
    }

    const sql = fs.readFileSync(path.join(directoryPath, fileName), "utf-8");

    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_history (kind, name) VALUES ($1, $2)", [
        kind,
        fileName,
      ]);
      await client.query("COMMIT");
      console.log(`Applied ${kind}: ${fileName}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

async function bootstrapSchema(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS business_registry");
    await client.query("SET search_path TO business_registry, public");
  } finally {
    client.release();
  }
}

export async function initializeDatabase(): Promise<void> {
  await bootstrapSchema();
  await applySqlFiles("migration", "migrations");
  await applySqlFiles("seed", "seeds");
}
