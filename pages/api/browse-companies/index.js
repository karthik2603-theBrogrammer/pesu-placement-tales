import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

/** Companies grouped by whether they have placement stories (browse page). */
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
        c.id,
        c.company_name,
        c.company_description,
        COUNT(sp.id)::int AS story_count
      FROM company c
      LEFT JOIN student_placed sp ON sp.company_placed_id = c.id
      GROUP BY c.id, c.company_name, c.company_description
      ORDER BY story_count DESC, c.company_name ASC;
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Browse companies error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
