import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../../utils/db";
import { readId, readPagination, requireAdmin } from "../../../../utils/adminAuth";

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default async function handler(req, res) {
  if (!isDbConfigured()) return res.status(503).json({ error: DB_CONFIG_ERROR });
  if (!requireAdmin(req, res)) return;

  const sql = getDb();

  try {
    if (req.method === "GET") {
      const { limit, offset } = readPagination(req);
      const rows = await sql`
        SELECT id, title, description, reproduction_steps, page_url, reporter_name, status, created_at
        FROM bug_reports
        ORDER BY created_at DESC
        LIMIT ${limit + 1} OFFSET ${offset};
      `;
      const hasMore = rows.length > limit;
      return res.status(200).json({ result: rows.slice(0, limit), hasMore });
    }

    if (req.method === "PUT") {
      const { id, title, description, reproduction_steps, page_url, reporter_name, status } =
        req.body || {};
      if (!id) return res.status(400).json({ error: "id is required." });
      const updated = await sql`
        UPDATE bug_reports SET
          title = ${trim(title)},
          description = ${trim(description)},
          reproduction_steps = ${trim(reproduction_steps) || null},
          page_url = ${trim(page_url) || null},
          reporter_name = ${trim(reporter_name) || null},
          status = ${trim(status) || "open"}
        WHERE id = ${id}
        RETURNING id, title, description, reproduction_steps, page_url, reporter_name, status, created_at;
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
