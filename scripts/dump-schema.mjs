/**
 * Introspects the live Neon/Postgres database and writes a CREATE TABLE style
 * schema to db/schema.sql. Run with: node scripts/dump-schema.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    const match = env.match(/^DATABASE_URL=(.*)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* ignore */
  }
  return null;
}

const url = loadDatabaseUrl();
if (!url) {
  console.error("DATABASE_URL not found in environment or .env");
  process.exit(1);
}

const sql = neon(url);

function formatType(col) {
  const t = col.data_type;
  if (t === "USER-DEFINED") {
    return (col.udt_name || "text").toUpperCase();
  }
  if (t === "ARRAY") {
    return `${(col.udt_name || "").replace(/^_/, "").toUpperCase()}[]`;
  }
  if (t === "character varying") {
    return col.character_maximum_length
      ? `VARCHAR(${col.character_maximum_length})`
      : "VARCHAR";
  }
  if (t === "character") {
    return col.character_maximum_length
      ? `CHAR(${col.character_maximum_length})`
      : "CHAR";
  }
  if (t === "numeric") {
    if (col.numeric_precision != null && col.numeric_scale != null) {
      return `NUMERIC(${col.numeric_precision}, ${col.numeric_scale})`;
    }
    return "NUMERIC";
  }
  const map = {
    integer: "INTEGER",
    bigint: "BIGINT",
    smallint: "SMALLINT",
    boolean: "BOOLEAN",
    text: "TEXT",
    "timestamp without time zone": "TIMESTAMP",
    "timestamp with time zone": "TIMESTAMPTZ",
    "double precision": "DOUBLE PRECISION",
    real: "REAL",
    date: "DATE",
    json: "JSON",
    jsonb: "JSONB",
    uuid: "UUID",
  };
  return map[t] || t.toUpperCase();
}

async function main() {
  const tables = await sql(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name;`
  );

  const parts = [
    "-- Auto-generated schema snapshot of the public schema.",
    "-- Source: live database (scripts/dump-schema.mjs).",
    `-- Generated: ${new Date().toISOString()}`,
    "",
  ];

  for (const { table_name } of tables) {
    const columns = await sql(
      `SELECT column_name, data_type, udt_name, character_maximum_length,
              numeric_precision, numeric_scale, is_nullable, column_default,
              ordinal_position
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position;`,
      [table_name]
    );

    const pkRows = await sql(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = $1
         AND tc.constraint_type = 'PRIMARY KEY'
       ORDER BY kcu.ordinal_position;`,
      [table_name]
    );
    const pkCols = pkRows.map((r) => r.column_name);

    const lines = columns.map((col) => {
      let line = `  ${col.column_name} ${formatType(col)}`;
      if (col.is_nullable === "NO") line += " NOT NULL";
      if (col.column_default) line += ` DEFAULT ${col.column_default}`;
      return line;
    });

    if (pkCols.length > 0) {
      lines.push(`  PRIMARY KEY (${pkCols.join(", ")})`);
    }

    parts.push(`CREATE TABLE ${table_name} (`);
    parts.push(lines.join(",\n"));
    parts.push(");");
    parts.push("");
  }

  mkdirSync(new URL("../db/", import.meta.url), { recursive: true });
  const outPath = new URL("../db/schema.sql", import.meta.url);
  writeFileSync(outPath, parts.join("\n"));
  console.log(`Wrote schema for ${tables.length} tables to db/schema.sql`);
}

main().catch((error) => {
  console.error("Failed to dump schema:", error);
  process.exit(1);
});
