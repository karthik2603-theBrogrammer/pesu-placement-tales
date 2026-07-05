import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

/** Latest placement stories for the home page (top 10). */
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
        sp.id,
        sp.first_name,
        sp.middle_name,
        sp.last_name,
        sp.job_title,
        sp.year_placed,
        sp.upvote,
        sp.downvote,
        sp.created_at,
        sp.internship_fte,
        sp.internship_only,
        sp.fte_only,
        sp.summer_internship,
        sp.verdict,
        sp.is_anonymous,
        c.company_name
      FROM student_placed sp
      JOIN company c ON sp.company_placed_id = c.id
      ORDER BY sp.created_at DESC, sp.id DESC
      LIMIT 10;
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Recent stories error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
