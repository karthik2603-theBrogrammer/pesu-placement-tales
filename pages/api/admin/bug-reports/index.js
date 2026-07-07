import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../../utils/db";
import { readId, readPagination, requireAdmin } from "../../../../utils/adminAuth";
import { ensureFeedbackTable } from "../../../../utils/feedback";
import {
  isValidBugStatus,
  validateAdminReply,
} from "../../../../utils/feedbackStatus";

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default async function handler(req, res) {
  if (!isDbConfigured()) return res.status(503).json({ error: DB_CONFIG_ERROR });
  if (!requireAdmin(req, res)) return;

  const sql = getDb();

  try {
    await ensureFeedbackTable(sql, "bug");

    if (req.method === "GET") {
      const { limit, offset } = readPagination(req);
      const rows = await sql`
        SELECT id, title, description, reproduction_steps, page_url, reporter_name, status, admin_reply, created_at
        FROM bug_reports
        ORDER BY created_at DESC
        LIMIT ${limit + 1} OFFSET ${offset};
      `;
      const hasMore = rows.length > limit;
      return res.status(200).json({ result: rows.slice(0, limit), hasMore });
    }

    if (req.method === "PUT") {
      const {
        id,
        title,
        description,
        reproduction_steps,
        page_url,
        reporter_name,
        status,
        admin_reply,
      } = req.body || {};
      if (!id) return res.status(400).json({ error: "id is required." });

      const nextStatus = trim(status) || "open";
      if (!isValidBugStatus(nextStatus)) {
        return res.status(400).json({ error: "Invalid status." });
      }
      const replyError = validateAdminReply(admin_reply);
      if (replyError) return res.status(400).json({ error: replyError });

      const updated = await sql`
        UPDATE bug_reports SET
          title = ${trim(title)},
          description = ${trim(description)},
          reproduction_steps = ${trim(reproduction_steps) || null},
          page_url = ${trim(page_url) || null},
          reporter_name = ${trim(reporter_name) || null},
          status = ${nextStatus},
          admin_reply = ${trim(admin_reply) || null}
        WHERE id = ${id}
        RETURNING id, title, description, reproduction_steps, page_url, reporter_name, status, admin_reply, created_at;
      `;
      if (updated.length === 0) return res.status(404).json({ error: "Not found." });
      return res.status(200).json({ result: updated[0] });
    }

    if (req.method === "DELETE") {
      const id = readId(req);
      if (!id) return res.status(400).json({ error: "id is required." });
      await sql`DELETE FROM bug_reports WHERE id = ${id};`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Admin bug-reports error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
