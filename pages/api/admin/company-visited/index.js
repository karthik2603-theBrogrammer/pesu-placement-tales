import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../../utils/db";

const trim = (value) => (typeof value === "string" ? value.trim() : "");
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const numOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const bool = (value) => value === true || value === "true" || value === 1;

/** Shared-secret guard. Returns true if the request is authorised. */
function isAuthorised(req, res) {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) {
    res.status(503).json({ error: "Admin token not configured on the server." });
    return false;
  }
  const provided = req.headers["x-admin-token"];
  if (!provided || provided !== configured) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

async function resolveCompany(sql, { company_id, new_company_name, new_company_description }) {
  if (company_id) {
    const rows = await sql`SELECT id, company_name FROM company WHERE id = ${company_id} LIMIT 1;`;
    if (rows.length === 0) {
      throw Object.assign(new Error("Company not found."), { statusCode: 400 });
    }
    return { id: rows[0].id, name: rows[0].company_name };
  }
  const name = trim(new_company_name);
  if (!name) throw Object.assign(new Error("Company is required."), { statusCode: 400 });

  const existing = await sql`
    SELECT id, company_name FROM company WHERE LOWER(company_name) = LOWER(${name}) LIMIT 1;
  `;
  if (existing.length > 0) return { id: existing[0].id, name: existing[0].company_name };

  const description = trim(new_company_description) || `${name} — added by admin.`;
  const created = await sql`
    INSERT INTO company (company_name, company_description)
    VALUES (${name}, ${description})
    RETURNING id, company_name;
  `;
  return { id: created[0].id, name: created[0].company_name };
}

export default async function handler(req, res) {
  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }
  if (!isAuthorised(req, res)) return;

  const sql = getDb();

  try {
    if (req.method === "GET") {
      const result = await sql`
        SELECT
          cv.id, c.id AS company_id, c.company_name, cv.year, cv.tier,
          cv.job_title, cv.cgpa_cutoff, cv.streams_allowed, cv.remarks,
          cv.base_salary, cv.ctc, cv.internship_stipend,
          cv.girls_only, cv.internship_only, cv.fte_only, cv.internship_fte,
          cv.summer_internship,
          cv.total_hired, cv.males_hired, cv.females_hired
        FROM company_visited cv
        JOIN company c ON cv.company_id = c.id
        ORDER BY cv.tier NULLS LAST, c.company_name ASC, cv.year DESC;
      `;
      return res.status(200).json({ result });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const year = parseInt(body.year, 10);
      if (!year || Number.isNaN(year)) {
        return res.status(400).json({ error: "A valid year is required." });
      }

      const streams = Array.isArray(body.streams_allowed)
        ? body.streams_allowed.join(",")
        : trim(body.streams_allowed) || null;
      const tier = body.tier ? parseInt(body.tier, 10) : null;
      const jobTitle = trim(body.job_title) || null;
      const remarks = trim(body.remarks) || null;
      const cgpa = numOrNull(body.cgpa_cutoff);

      const fields = {
        year,
        tier,
        streams_allowed: streams,
        job_title: jobTitle,
        cgpa_cutoff: cgpa,
        remarks,
        base_salary: num(body.base_salary),
        ctc: num(body.ctc),
        internship_stipend: num(body.internship_stipend),
        girls_only: bool(body.girls_only),
        internship_only: bool(body.internship_only),
        fte_only: bool(body.fte_only),
        internship_fte: bool(body.internship_fte),
        summer_internship: bool(body.summer_internship),
        total_hired: num(body.total_hired),
        males_hired: num(body.males_hired),
        females_hired: num(body.females_hired),
      };

      // Update by id, otherwise insert a new record.
      if (body.id) {
        const id = parseInt(body.id, 10);
        const company = await resolveCompany(sql, body);
        const updated = await sql`
          UPDATE company_visited SET
            company_id = ${company.id},
            year = ${fields.year},
            tier = ${fields.tier},
            streams_allowed = ${fields.streams_allowed},
            job_title = ${fields.job_title},
            cgpa_cutoff = ${fields.cgpa_cutoff},
            remarks = ${fields.remarks},
            base_salary = ${fields.base_salary},
            ctc = ${fields.ctc},
            internship_stipend = ${fields.internship_stipend},
            girls_only = ${fields.girls_only},
            internship_only = ${fields.internship_only},
            fte_only = ${fields.fte_only},
            internship_fte = ${fields.internship_fte},
            summer_internship = ${fields.summer_internship},
            total_hired = ${fields.total_hired},
            males_hired = ${fields.males_hired},
            females_hired = ${fields.females_hired}
          WHERE id = ${id}
          RETURNING id;
        `;
        if (updated.length === 0) {
          return res.status(404).json({ error: "Record not found." });
        }
        return res.status(200).json({ id: updated[0].id, companyName: company.name });
      }

      const company = await resolveCompany(sql, body);
      const saved = await sql`
        INSERT INTO company_visited (
          company_id, year, tier, streams_allowed, job_title, cgpa_cutoff, remarks,
          base_salary, ctc, internship_stipend,
          girls_only, internship_only, fte_only, internship_fte, summer_internship,
          total_hired, males_hired, females_hired
        )
        VALUES (
          ${company.id}, ${fields.year}, ${fields.tier}, ${fields.streams_allowed},
          ${fields.job_title}, ${fields.cgpa_cutoff}, ${fields.remarks},
          ${fields.base_salary}, ${fields.ctc}, ${fields.internship_stipend},
          ${fields.girls_only}, ${fields.internship_only}, ${fields.fte_only}, ${fields.internship_fte},
          ${fields.summer_internship},
          ${fields.total_hired}, ${fields.males_hired}, ${fields.females_hired}
        )
        RETURNING id;
      `;
      return res.status(200).json({ id: saved[0].id, companyName: company.name });
    }

    if (req.method === "DELETE") {
      const source = req.body && Object.keys(req.body).length ? req.body : req.query;
      const id = parseInt(source.id, 10);
      if (!id) {
        return res.status(400).json({ error: "id is required." });
      }
      await sql`DELETE FROM company_visited WHERE id = ${id};`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Admin company-visited error:", error);
    const statusCode = error.statusCode || 500;
    return res
      .status(statusCode)
      .json({ error: statusCode === 500 ? "Internal server error." : error.message });
  }
}
