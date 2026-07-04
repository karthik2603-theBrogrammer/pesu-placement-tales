/**
 * Imports the "Tier 1 Placements 2025" CSV (CSE branch, year 2024) into
 * company_visited. Handles merged company cells (multiple roles), messy
 * compensation formats (LPA vs absolute, ranges, comma grouping) and multi-line
 * quoted remarks. Idempotent for this slice: it clears existing
 * year=2024 / tier=1 rows before importing.
 *
 * Run: node scripts/import-tier1-2024.mjs
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const YEAR = 2024;
const TIER = 1;
const STREAMS = "CSE";
const CSV_PATH = new URL(
  "../sheets/Internships and Placements - 2025 - Tier 1 Placements 2025.csv",
  import.meta.url
);

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

/** Minimal RFC-4180 CSV parser (handles quotes + embedded newlines). */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Money cells mix LPA (small) and absolute rupees (large, comma-grouped). */
function parseMoney(raw, unit) {
  if (raw == null) return 0;
  let s = String(raw).trim().replace(/[₹$%]/g, "").replace(/USD/gi, "").trim();
  if (!s) return 0;
  const range = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  let val;
  if (range) {
    val = (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  } else {
    const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    if (!m) return 0;
    val = parseFloat(m[0]);
  }
  if (!Number.isFinite(val)) return 0;
  if (unit === "lakh") return Math.round(val < 1000 ? val * 100000 : val);
  if (unit === "thousand") return Math.round(val < 1000 ? val * 1000 : val);
  return Math.round(val);
}

function parseCount(raw) {
  if (raw == null) return 0;
  const m = String(raw).replace(/,/g, "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function parseCgpa(raw) {
  if (raw == null) return null;
  const m = String(raw).match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

const SUMMARY = new Set(["placed", "total", "t1", "t2", "t3", "final"]);
const isSummary = (row) =>
  [row[3], row[4], row[5]].some((c) => SUMMARY.has(String(c || "").trim().toLowerCase()));

async function resolveCompanyId(name, cache) {
  const key = name.toLowerCase();
  if (cache.has(key)) return cache.get(key);
  const existing = await sql`
    SELECT id FROM company WHERE LOWER(company_name) = ${key} LIMIT 1;
  `;
  if (existing.length > 0) {
    cache.set(key, existing[0].id);
    return existing[0].id;
  }
  const created = await sql`
    INSERT INTO company (company_name, company_description)
    VALUES (${name}, ${`${name} — Tier 1 recruiter (CSE, 2024).`})
    RETURNING id;
  `;
  cache.set(key, created[0].id);
  return created[0].id;
}

async function main() {
  const text = readFileSync(CSV_PATH, "utf8");
  const records = parseCSV(text).slice(2); // drop the two header rows

  const cache = new Map();
  let currentCompany = "";
  let imported = 0;

  await sql`DELETE FROM company_visited WHERE year = ${YEAR} AND tier = ${TIER};`;

  for (const rec of records) {
    const name = (rec[1] || "").trim();
    if (name.toLowerCase().startsWith("ppo")) break; // stop before PPO section
    if (isSummary(rec)) continue;

    if (name) currentCompany = name;
    const company = name || currentCompany;
    if (!company) continue;

    const job = (rec[2] || "").trim();
    const stipend = parseMoney(rec[3], "thousand");
    const base = parseMoney(rec[4], "lakh");
    const ctc = parseMoney(rec[5], "lakh");
    const internCount = parseCount(rec[6]);
    const fteCount = parseCount(rec[7]);
    const cgpa = parseCgpa(rec[8]);
    const remarks = (rec[9] || "").trim();

    const hasData =
      job || stipend || base || ctc || internCount || fteCount || cgpa || remarks;
    if (!hasData) continue;

    const total = internCount + fteCount;
    const internshipOnly = internCount > 0 && fteCount === 0;
    const fteOnly = fteCount > 0 && internCount === 0;
    const internshipFte = internCount > 0 && fteCount > 0;
    const girlsOnly = /female|girls?\s*(only|hiring)|only\s*girls|major hiring-?\s*girls/i.test(
      `${job} ${remarks}`
    );

    const companyId = await resolveCompanyId(company, cache);

    await sql`
      INSERT INTO company_visited (
        company_id, year, tier, streams_allowed, job_title, cgpa_cutoff, remarks,
        base_salary, ctc, internship_stipend,
        girls_only, internship_only, fte_only, internship_fte,
        total_hired, males_hired, females_hired
      )
      VALUES (
        ${companyId}, ${YEAR}, ${TIER}, ${STREAMS}, ${job || null}, ${cgpa}, ${remarks || null},
        ${base}, ${ctc}, ${stipend},
        ${girlsOnly}, ${internshipOnly}, ${fteOnly}, ${internshipFte},
        ${total}, 0, 0
      );
    `;
    imported++;
  }

  console.log(`Imported ${imported} placement rows for ${YEAR} (Tier ${TIER}, ${STREAMS}).`);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
