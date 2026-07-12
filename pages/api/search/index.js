import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

/**
 * Full-text search across stories.
 *
 * GET /api/search?q=system+design
 * Returns matching stories with company info, capped at 30.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const q = String(req.query.q || "").trim();
  if (!q || q.length < 2) {
    return res.status(200).json({ result: [] });
  }

  // Wrap in % for ILIKE pattern matching
  const pattern = `%${q}%`;

  try {
    const sql = getDb();
    const result = await sql`
      SELECT
        sp.id AS student_id,
        sp.first_name,
        sp.middle_name,
        sp.last_name,
        sp.job_title,
        sp.year_placed,
        sp.batch_of,
        sp.verdict,
        sp.degree,
        sp.internship_fte,
        sp.internship_only,
        sp.fte_only,
        sp.summer_internship,
        sp.upvote,
        sp.downvote,
        sp.is_anonymous,
        sp.created_at,
        sp.company_placed_id AS company_id,
        c.company_name
      FROM student_placed sp
      JOIN company c ON sp.company_placed_id = c.id
      WHERE
        sp.remarks_markdown ILIKE ${pattern}
        OR sp.job_title ILIKE ${pattern}
        OR c.company_name ILIKE ${pattern}
        OR sp.first_name ILIKE ${pattern}
        OR sp.last_name ILIKE ${pattern}
      ORDER BY
        COALESCE(sp.upvote, 0) DESC,
        sp.created_at DESC
      LIMIT 30;
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
