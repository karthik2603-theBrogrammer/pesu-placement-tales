import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";

const VALID_DELTAS = new Set([-1, 0, 1]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const { requestId, upDelta = 0, downDelta = 0 } = req.body || {};
  const id = parseInt(requestId, 10);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid requestId." });
  }
  if (!VALID_DELTAS.has(upDelta) || !VALID_DELTAS.has(downDelta)) {
    return res.status(400).json({ error: "Invalid vote delta." });
  }

  try {
    const sql = getDb();
    const result = await sql`
      UPDATE feature_requests
      SET
        upvote = GREATEST(COALESCE(upvote, 0) + ${upDelta}, 0),
        downvote = GREATEST(COALESCE(downvote, 0) + ${downDelta}, 0)
      WHERE id = ${id}
      RETURNING upvote, downvote;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Feature request not found." });
    }

    return res.status(200).json({
      upvote: result[0].upvote,
      downvote: result[0].downvote,
    });
  } catch (error) {
    console.error("Feature vote error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
