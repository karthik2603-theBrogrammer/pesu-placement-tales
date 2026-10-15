import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";
import { isValidVerdict } from "../../../utils/verdict";
import { isValidDegree } from "../../../utils/degree";
import { ANONYMOUS_PLACEHOLDER } from "../../../utils/displayName";
import { captureServerEvent } from "../../../lib/posthog-server";

const trim = (value) => (typeof value === "string" ? value.trim() : "");

const SHORT_TEXT_LIMIT = 255;
const REMARKS_LIMIT = 20000;
const MIN_YEAR = 1980;

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
    job_title,
    year_placed,
    batch_of,
    verdict,
    linkedin_url,
    phone_number,
    remarks_markdown,
    company_id,
    new_company_name,
    new_company_description,
    internship_fte,
    internship_only,
    fte_only,
    summer_internship,
    degree,
    is_anonymous,
  } = req.body || {};

  if (!trim(job_title)) {
    return res.status(400).json({ error: "Job title is required." });
  }

  const tooLong = [
    [first_name, "First name"],
    [middle_name, "Middle name"],
    [last_name, "Last name"],
    [job_title, "Job title"],
    [new_company_name, "Company name"],
    [new_company_description, "Company description"],
  ].find(([value]) => trim(value).length > SHORT_TEXT_LIMIT);
  if (tooLong) {
    return res
      .status(400)
      .json({ error: `${tooLong[1]} must be ${SHORT_TEXT_LIMIT} characters or fewer.` });
  }

  if (trim(remarks_markdown).length > REMARKS_LIMIT) {
    return res
      .status(400)
      .json({ error: `Experience details must be ${REMARKS_LIMIT} characters or fewer.` });
  }

  if (company_id && !/^\d+$/.test(String(company_id))) {
    return res.status(400).json({ error: "Selected company not found." });
  }

  const maxYear = new Date().getFullYear() + 5;
  const year = parseInt(year_placed, 10);
  if (!year || Number.isNaN(year) || year < MIN_YEAR || year > maxYear) {
    return res.status(400).json({ error: "A valid interview year is required." });
  }

  const batch = parseInt(batch_of, 10);
  if (!batch || Number.isNaN(batch) || batch < MIN_YEAR || batch > maxYear) {
    return res.status(400).json({ error: "A valid batch year is required." });
  }

  if (!isValidVerdict(verdict)) {
    return res.status(400).json({ error: "Verdict must be Selected or Rejected." });
  }

  if (!isValidDegree(degree)) {
    return res.status(400).json({ error: "Select a valid degree." });
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

  // Anonymous stories never store the contributor's identity, whatever the client sends.
  const anonymous = !!is_anonymous;
  const identity = anonymous
    ? { ...ANONYMOUS_PLACEHOLDER, linkedin: "", phone: null }
    : {
        first_name: trim(first_name),
        middle_name: trim(middle_name),
        last_name: trim(last_name),
        linkedin: linkedin || "",
        phone: phone || null,
      };

  try {
    const sql = getDb();

    const company = await resolveCompany(sql, {
      company_id,
      new_company_name,
      new_company_description,
    });

    const inserted = await sql`
      INSERT INTO student_placed (
        first_name, middle_name, last_name, job_title,
        company_placed_id, year_placed, batch_of, linkedin_url,
        phone_number, remarks_markdown,
        internship_fte, internship_only, fte_only, summer_internship,
        verdict, degree, is_anonymous
      )
      VALUES (
        ${identity.first_name}, ${identity.middle_name}, ${identity.last_name}, ${trim(job_title)},
        ${company.id}, ${year}, ${batch}, ${identity.linkedin},
        ${identity.phone}, ${trim(remarks_markdown)},
        ${!!internship_fte}, ${!!internship_only}, ${!!fte_only}, ${!!summer_internship},
        ${verdict}, ${degree}, ${anonymous}
      )
      RETURNING id;
    `;

    await captureServerEvent({
      distinctId: req.headers['x-posthog-distinct-id'] || `anon-${inserted[0].id}`,
      event: 'server_story_submitted',
      properties: {
        student_id: inserted[0].id,
        company_id: company.id,
        company_name: company.name,
        verdict,
        year_placed: year,
        batch_of: batch,
        is_anonymous: !!is_anonymous,
        is_new_company: !company_id,
      },
    });

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
