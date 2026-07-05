/**
 * Adds placement-type flags to student_placed.
 * Run: node scripts/migrate-student-placement-type.mjs
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

await sql`ALTER TABLE student_placed ADD COLUMN IF NOT EXISTS internship_fte BOOLEAN NOT NULL DEFAULT false;`;
await sql`ALTER TABLE student_placed ADD COLUMN IF NOT EXISTS internship_only BOOLEAN NOT NULL DEFAULT false;`;
await sql`ALTER TABLE student_placed ADD COLUMN IF NOT EXISTS fte_only BOOLEAN NOT NULL DEFAULT false;`;
await sql`ALTER TABLE student_placed ADD COLUMN IF NOT EXISTS summer_internship BOOLEAN NOT NULL DEFAULT false;`;
console.log("✓ student_placed placement-type columns ready.");
