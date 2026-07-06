/**
 * Adds batch_of to student_placed and backfills existing rows as 2025.
 * Run: node db/migrate-batch-of.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, "..", ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* .env optional when vars are already exported */
  }
}

loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

await sql`
  ALTER TABLE student_placed
  ADD COLUMN IF NOT EXISTS batch_of BIGINT NOT NULL DEFAULT 2025
`;
console.log("OK: ADD COLUMN batch_of");

await sql`
  UPDATE student_placed SET batch_of = 2025 WHERE batch_of IS NULL
`;
console.log("OK: backfill batch_of = 2025");

const [check] = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'student_placed' AND column_name = 'batch_of'
`;
if (!check) {
  console.error("Migration failed: batch_of column not found.");
  process.exit(1);
}

console.log("batch_of migration complete.");
