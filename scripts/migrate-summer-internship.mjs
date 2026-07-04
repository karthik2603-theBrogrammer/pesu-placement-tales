/**
 * Adds summer_internship flag to company_visited.
 * Run: node scripts/migrate-summer-internship.mjs
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
  ALTER TABLE company_visited
  ADD COLUMN IF NOT EXISTS summer_internship BOOLEAN NOT NULL DEFAULT false;
`;
console.log("✓ company_visited.summer_internship ready.");
