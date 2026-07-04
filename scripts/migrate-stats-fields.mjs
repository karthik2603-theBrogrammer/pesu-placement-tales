/**
 * Migration: extend company_visited for the richer stats dashboard.
 *  - surrogate `id` primary key (allows multiple job roles per company/year)
 *  - job_title, cgpa_cutoff, remarks, streams_allowed, tier
 * Idempotent — safe to run multiple times.
 *
 * Run: node scripts/migrate-stats-fields.mjs
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const match = env.match(/^DATABASE_URL=(.*)$/m);
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

const url = loadDatabaseUrl();
if (!url) {
  console.error("DATABASE_URL not found.");
  process.exit(1);
}
const sql = neon(url);

const statements = [
  `ALTER TABLE company_visited ADD COLUMN IF NOT EXISTS id SERIAL;`,
  `ALTER TABLE company_visited ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);`,
  `ALTER TABLE company_visited ADD COLUMN IF NOT EXISTS cgpa_cutoff DOUBLE PRECISION;`,
  `ALTER TABLE company_visited ADD COLUMN IF NOT EXISTS remarks TEXT;`,
  `ALTER TABLE company_visited ADD COLUMN IF NOT EXISTS streams_allowed TEXT;`,
  `ALTER TABLE company_visited ADD COLUMN IF NOT EXISTS tier SMALLINT;`,
  // Swap composite PK (company_id, year) for surrogate id. The re-created PK is
  // also named company_visited_pkey, keeping this idempotent.
  `ALTER TABLE company_visited DROP CONSTRAINT IF EXISTS company_visited_pkey;`,
  `ALTER TABLE company_visited ADD PRIMARY KEY (id);`,
];

async function main() {
  for (const stmt of statements) {
    await sql(stmt);
    console.log("✓", stmt);
  }
  console.log("Migration complete.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
