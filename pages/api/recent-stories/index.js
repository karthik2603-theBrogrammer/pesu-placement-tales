import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";
import { fetchRecentStories } from "../../../utils/recentStories";

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
    const result = await fetchRecentStories(sql);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Recent stories error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
