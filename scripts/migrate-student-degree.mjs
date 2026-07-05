/**
 * Adds degree stream to student_placed (default CSE for existing rows).
 * Run: node scripts/migrate-student-degree.mjs
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
  ADD COLUMN IF NOT EXISTS degree VARCHAR(16) NOT NULL DEFAULT 'CSE';
`;
await sql`UPDATE student_placed SET degree = 'CSE' WHERE degree IS NULL OR degree = '';`;
console.log("✓ student_placed.degree ready (existing rows → CSE).");
