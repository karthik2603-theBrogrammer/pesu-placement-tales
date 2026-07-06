import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";
import { getTrendingStories } from "../../../utils/trendingStories";

/** Top placement stories for the home page (PostHog browse sort when available). */
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
    const { result, sortBy } = await getTrendingStories(sql);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ result, sortBy });
  } catch (error) {
    console.error("Trending stories error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
