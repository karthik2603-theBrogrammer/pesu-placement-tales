/**
 * Adds verdict to student_placed (selected | rejected).
 * Existing rows default to selected.
 * Run: node scripts/migrate-student-verdict.mjs
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

await sql`
  ALTER TABLE student_placed
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(16) NOT NULL DEFAULT 'selected';
`;
await sql`UPDATE student_placed SET verdict = 'selected' WHERE verdict IS NULL OR verdict = '';`;
console.log("✓ student_placed.verdict ready (existing rows → selected).");
