import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";
import {
  ensureFeedbackTable,
  normalizeText,
  validateRequiredText,
} from "../../../utils/feedback";

const TITLE_LIMIT = 140;
const DESCRIPTION_LIMIT = 1200;
const NAME_LIMIT = 80;

export default async function handler(req, res) {
  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const sql = getDb();

  try {
    await ensureFeedbackTable(sql, "feature");

    if (req.method === "GET") {
      const result = await sql(`
        SELECT id, title, description, requester_name, status, created_at,
               COALESCE(upvote, 0) AS upvote, COALESCE(downvote, 0) AS downvote
        FROM feature_requests
        ORDER BY (COALESCE(upvote, 0) - COALESCE(downvote, 0)) DESC, created_at DESC;
      `);

      return res.status(200).json({ result });
    }

    if (req.method === "POST") {
      const { title, description, requester_name } = req.body || {};
      const titleError = validateRequiredText(title, "Title", TITLE_LIMIT);
      const descriptionError = validateRequiredText(
        description,
        "Description",
        DESCRIPTION_LIMIT
      );
      const requesterName = normalizeText(requester_name);

      if (titleError || descriptionError) {
        return res
          .status(400)
          .json({ error: titleError || descriptionError });
      }

      if (requesterName.length > NAME_LIMIT) {
        return res
          .status(400)
          .json({ error: `Name must be ${NAME_LIMIT} characters or fewer.` });
      }

      const result = await sql(
        `
          INSERT INTO feature_requests (title, description, requester_name)
          VALUES ($1, $2, $3)
          RETURNING id, title, description, requester_name, status, created_at, upvote, downvote;
        `,
        [
          normalizeText(title),
          normalizeText(description),
          requesterName || null,
        ]
      );

      return res.status(201).json({ result: result[0] });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Feature request API error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
