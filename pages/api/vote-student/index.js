import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";
import { captureServerEvent } from "../../../lib/posthog-server";

const VALID_DELTAS = new Set([-1, 0, 1]);

/**
 * Adjusts upvote/downvote counts for a student experience.
 * The client sends deltas (derived from local vote state) so a single call can
 * toggle a vote or switch from up to down. Counts are floored at 0.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const { studentId, upDelta = 0, downDelta = 0 } = req.body || {};

  const id = parseInt(studentId, 10);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid studentId." });
  }

  if (!VALID_DELTAS.has(upDelta) || !VALID_DELTAS.has(downDelta)) {
    return res.status(400).json({ error: "Invalid vote delta." });
  }

  try {
    const sql = getDb();
    const result = await sql`
      UPDATE student_placed
      SET
        upvote = GREATEST(COALESCE(upvote, 0) + ${upDelta}, 0),
        downvote = GREATEST(COALESCE(downvote, 0) + ${downDelta}, 0)
      WHERE id = ${id}
      RETURNING upvote, downvote;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Experience not found." });
    }

    await captureServerEvent({
      distinctId: req.headers['x-posthog-distinct-id'] || 'anon-voter',
      event: 'server_story_voted',
      properties: {
        student_id: id,
        up_delta: upDelta,
        down_delta: downDelta,
      },
    });

    return res.status(200).json({
      upvote: result[0].upvote,
      downvote: result[0].downvote,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
