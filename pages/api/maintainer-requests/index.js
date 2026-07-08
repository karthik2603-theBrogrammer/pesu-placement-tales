import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

const MAINTAINER_SCHEMA = `
  CREATE TABLE IF NOT EXISTS maintainer_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    batch VARCHAR(20) NOT NULL,
    department VARCHAR(120) NOT NULL,
    degree VARCHAR(120) NOT NULL,
    linkedin_url TEXT NOT NULL,
    email VARCHAR(180) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const trim = (value) => (typeof value === "string" ? value.trim() : "");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const { full_name, batch, department, degree, linkedin_url, email, reason } =
    req.body || {};

  const values = {
    full_name: trim(full_name),
    batch: trim(batch),
    department: trim(department),
    degree: trim(degree),
    linkedin_url: trim(linkedin_url),
    email: trim(email),
    reason: trim(reason),
  };

  const missing = [
    "full_name",
    "batch",
    "department",
    "degree",
    "linkedin_url",
    "email",
    "reason",
  ].filter((field) => !values[field]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Please fill: ${missing.join(", ")}.` });
  }

  if (!EMAIL_REGEX.test(values.email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  if (!LINKEDIN_REGEX.test(values.linkedin_url)) {
    return res.status(400).json({ error: "Enter a valid LinkedIn URL." });
  }

  try {
    const sql = getDb();
    await sql(MAINTAINER_SCHEMA);

    const inserted = await sql`
      INSERT INTO maintainer_requests (
        full_name, batch, department, degree, linkedin_url, email, reason
      )
      VALUES (
        ${values.full_name}, ${values.batch}, ${values.department},
        ${values.degree}, ${values.linkedin_url}, ${values.email},
        ${values.reason}
      )
      RETURNING id, created_at;
    `;

    return res.status(201).json({ id: inserted[0].id, created_at: inserted[0].created_at });
  } catch (error) {
    console.error("Maintainer request error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
