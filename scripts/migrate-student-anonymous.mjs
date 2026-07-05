/**
 * Adds is_anonymous to student_placed; backfills John Doe placeholder rows.
 * Run: node scripts/migrate-student-anonymous.mjs
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
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;
`;
await sql`
  UPDATE student_placed
  SET is_anonymous = true
  WHERE is_anonymous = false
    AND first_name = 'John'
    AND last_name = 'Doe'
    AND COALESCE(middle_name, '') = ''
    AND COALESCE(linkedin_url, '') = ''
    AND COALESCE(phone_number, '') = '';
`;
console.log("✓ student_placed.is_anonymous ready (John Doe rows flagged).");
