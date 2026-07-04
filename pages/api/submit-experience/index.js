import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

const trim = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Resolves the company for a submission:
 *  - existing company  -> validated + reused
 *  - new company name  -> reused if it already exists (case-insensitive),
 *                         otherwise created
 * Returns { id, name }.
 */
async function resolveCompany(sql, { company_id, new_company_name, new_company_description }) {
  if (company_id) {
    const rows = await sql`
      SELECT id, company_name FROM company WHERE id = ${company_id} LIMIT 1;
    `;
    if (rows.length === 0) {
      throw Object.assign(new Error("Selected company not found."), {
        statusCode: 400,
      });
    }
    return { id: rows[0].id, name: rows[0].company_name };
  }

  const name = trim(new_company_name);
  if (!name) {
    throw Object.assign(new Error("Company is required."), { statusCode: 400 });
  }

  const existing = await sql`
    SELECT id, company_name FROM company
    WHERE LOWER(company_name) = LOWER(${name})
    LIMIT 1;
  `;
  if (existing.length > 0) {
    return { id: existing[0].id, name: existing[0].company_name };
  }

  const description =
    trim(new_company_description) || `${name} — shared by a student.`;
  const created = await sql`
    INSERT INTO company (company_name, company_description)
    VALUES (${name}, ${description})
    RETURNING id, company_name;
  `;
  return { id: created[0].id, name: created[0].company_name };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const {
    first_name,
    middle_name,
    last_name,
    year_placed,
    linkedin_url,
    phone_number,
    remarks_markdown,
    company_id,
    new_company_name,
    new_company_description,
  } = req.body || {};

  if (!trim(first_name) || !trim(last_name)) {
    return res.status(400).json({ error: "First and last name are required." });
  }

  const year = parseInt(year_placed, 10);
  if (!year || Number.isNaN(year)) {
    return res.status(400).json({ error: "A valid placement year is required." });
  }

  if (!trim(remarks_markdown)) {
    return res.status(400).json({ error: "Experience details are required." });
  }

  if (!company_id && !trim(new_company_name)) {
    return res.status(400).json({ error: "Please choose or add a company." });
  }

  const linkedin = trim(linkedin_url);
  if (linkedin) {
    const linkedinRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    if (!linkedinRegex.test(linkedin)) {
      return res.status(400).json({ error: "Enter a valid LinkedIn URL." });
    }
  }

  const phone = trim(phone_number);
  if (phone && !/^[+]?[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({ error: "Enter a valid phone number." });
  }

  try {
    const sql = getDb();

    const company = await resolveCompany(sql, {
      company_id,
      new_company_name,
      new_company_description,
    });

    const inserted = await sql`
      INSERT INTO student_placed (
        first_name, middle_name, last_name,
        company_placed_id, year_placed, linkedin_url,
        phone_number, remarks_markdown
      )
      VALUES (
        ${trim(first_name)}, ${trim(middle_name)}, ${trim(last_name)},
        ${company.id}, ${year}, ${linkedin || null},
        ${phone || null}, ${trim(remarks_markdown)}
      )
      RETURNING id;
    `;

    return res.status(201).json({
      studentId: inserted[0].id,
      companyId: company.id,
      companyName: company.name,
    });
  } catch (error) {
    console.error("Submit experience error:", error);
    const statusCode = error.statusCode || 500;
    return res
      .status(statusCode)
      .json({ error: statusCode === 500 ? "Internal server error." : error.message });
  }
}
