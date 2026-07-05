/**
 * Adds upvote/downvote to feature_requests.
 * Run: node scripts/migrate-feature-votes.mjs
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

await sql`ALTER TABLE feature_requests ADD COLUMN IF NOT EXISTS upvote INTEGER NOT NULL DEFAULT 0;`;
await sql`ALTER TABLE feature_requests ADD COLUMN IF NOT EXISTS downvote INTEGER NOT NULL DEFAULT 0;`;
console.log("✓ feature_requests upvote/downvote ready.");
