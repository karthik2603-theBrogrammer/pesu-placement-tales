import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

/**
 * Returns per-company filter metadata so the browse directory can filter
 * companies by degree, batch, verdict, and placement type without loading
 * full story data.
 *
 * GET /api/browse-companies/filters
 * Response: { result: [{ company_id, degrees, batches, verdicts, ... }] }
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
        sp.company_placed_id AS company_id,
        array_agg(DISTINCT sp.degree)          AS degrees,
        array_agg(DISTINCT sp.batch_of::text)  AS batches,
        array_agg(DISTINCT sp.verdict)         AS verdicts,
        bool_or(sp.internship_only OR sp.summer_internship) AS has_intern,
        bool_or(sp.fte_only)           AS has_fte,
        bool_or(sp.internship_fte)     AS has_intern_fte,
        bool_or(sp.summer_internship)  AS has_summer_intern
      FROM student_placed sp
      GROUP BY sp.company_placed_id;
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Browse company filters error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
