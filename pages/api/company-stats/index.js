import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

/**
 * Returns every company_visited record joined with its company name.
 * Powers the stats dashboard (filtering/aggregation happens client-side).
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  try {
    const sql = getDb();
    const result = await sql`
      SELECT
        cv.id,
        c.id AS company_id,
        c.company_name,
        cv.year,
        cv.tier,
        cv.job_title,
        cv.cgpa_cutoff,
        cv.streams_allowed,
        cv.remarks,
        cv.base_salary,
        cv.ctc,
        cv.internship_stipend,
        cv.girls_only,
        cv.internship_only,
        cv.fte_only,
        cv.internship_fte,
        cv.summer_internship,
        cv.total_hired,
        cv.males_hired,
        cv.females_hired
      FROM company_visited cv
      JOIN company c ON cv.company_id = c.id
      WHERE (
        COALESCE(cv.total_hired, 0) <> 0
        OR COALESCE(cv.ctc, 0) <> 0
        OR COALESCE(cv.base_salary, 0) <> 0
        OR COALESCE(cv.internship_stipend, 0) <> 0
      )
      ORDER BY cv.tier NULLS LAST, c.company_name ASC, cv.year DESC;
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Company stats error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
