import { neon } from "@neondatabase/serverless";

export const DB_CONFIG_ERROR =
  "Database is not configured. Add DATABASE_URL to your .env file.";

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(DB_CONFIG_ERROR);
  }
  return neon(databaseUrl);
}
