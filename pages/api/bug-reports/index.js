import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../utils/db";
import {
  ensureFeedbackTable,
  normalizeText,
  validateRequiredText,
} from "../../../utils/feedback";

const TITLE_LIMIT = 140;
const DESCRIPTION_LIMIT = 1200;
const STEPS_LIMIT = 1600;
const URL_LIMIT = 300;
const NAME_LIMIT = 80;

function isValidUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  const sql = getDb();

  try {
    await ensureFeedbackTable(sql, "bug");

    if (req.method === "GET") {
      const result = await sql(`
        SELECT id, title, description, reproduction_steps, page_url, reporter_name, status, created_at
        FROM bug_reports
        ORDER BY created_at DESC;
      `);

      return res.status(200).json({ result });
    }

    if (req.method === "POST") {
      const {
        title,
        description,
        reproduction_steps,
        page_url,
        reporter_name,
      } = req.body || {};

      const titleError = validateRequiredText(title, "Title", TITLE_LIMIT);
      const descriptionError = validateRequiredText(
        description,
        "Description",
        DESCRIPTION_LIMIT
      );
      const steps = normalizeText(reproduction_steps);
      const pageUrl = normalizeText(page_url);
      const reporterName = normalizeText(reporter_name);

      if (titleError || descriptionError) {
        return res
          .status(400)
          .json({ error: titleError || descriptionError });
      }

      if (steps.length > STEPS_LIMIT) {
        return res.status(400).json({
          error: `Steps must be ${STEPS_LIMIT} characters or fewer.`,
        });
      }

      if (pageUrl.length > URL_LIMIT || !isValidUrl(pageUrl)) {
        return res.status(400).json({ error: "Enter a valid page URL." });
      }

      if (reporterName.length > NAME_LIMIT) {
        return res
          .status(400)
          .json({ error: `Name must be ${NAME_LIMIT} characters or fewer.` });
      }

      const result = await sql(
        `
          INSERT INTO bug_reports (
            title,
            description,
            reproduction_steps,
            page_url,
            reporter_name
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, title, description, reproduction_steps, page_url, reporter_name, status, created_at;
        `,
        [
          normalizeText(title),
          normalizeText(description),
          steps || null,
          pageUrl || null,
          reporterName || null,
        ]
      );

      return res.status(201).json({ result: result[0] });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Bug report API error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
