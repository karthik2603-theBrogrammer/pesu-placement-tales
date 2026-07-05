import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../../utils/db";
import { requireAdmin } from "../../../../utils/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) return res.status(503).json({ error: DB_CONFIG_ERROR });
  if (!requireAdmin(req, res)) return;

  try {
    const sql = getDb();
    const [stories, features, companies, bugs] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM student_placed;`,
      sql`SELECT COUNT(*)::int AS count FROM feature_requests;`,
      sql`SELECT COUNT(*)::int AS count FROM company;`,
      sql`SELECT COUNT(*)::int AS count FROM bug_reports;`,
    ]);

    return res.status(200).json({
      stories: stories[0]?.count ?? 0,
      featureRequests: features[0]?.count ?? 0,
      companies: companies[0]?.count ?? 0,
      bugReports: bugs[0]?.count ?? 0,
    });
  } catch (error) {
    console.error("Admin stats summary error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
