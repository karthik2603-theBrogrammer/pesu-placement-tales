/**
 * Adds job_title to student_placed for placement story submissions.
 * Run: node scripts/migrate-student-job-title.mjs
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
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(255) NOT NULL DEFAULT '';
`;
console.log("✓ student_placed.job_title ready.");
