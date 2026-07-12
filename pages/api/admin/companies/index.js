import { requireAdmin, readPagination, readId } from "../../../../utils/adminAuth";
import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../../utils/db";

export default async function handler(req, res) {
  if (!isDbConfigured()) {
    return res.status(503).json({ error: DB_CONFIG_ERROR });
  }

  if (!requireAdmin(req, res)) return;

  const sql = getDb();

  try {
    if (req.method === "GET") {
      const { limit, offset } = readPagination(req);

      const result = await sql`
        SELECT *
        FROM company
        ORDER BY id DESC
        LIMIT ${limit + 1} OFFSET ${offset}
      `;

      const hasMore = result.length > limit;
      if (hasMore) result.pop();

      return res.status(200).json({ result, hasMore });
    }

    if (req.method === "PUT") {
      const { id, company_name, company_description } = req.body;
      if (!id || !company_name) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const updated = await sql`
        UPDATE company
        SET company_name = ${company_name}, company_description = ${company_description || ""}
        WHERE id = ${id}
        RETURNING *
      `;

      if (!updated.length) {
        return res.status(404).json({ error: "Company not found." });
      }

      return res.status(200).json({ result: updated[0] });
    }

    if (req.method === "DELETE") {
      const id = readId(req);
      if (!id) return res.status(400).json({ error: "ID required." });
      // Optional: check for linked records before deletion to give a friendly error
      const visits = await sql`SELECT id FROM company_visited WHERE company_id = ${id} LIMIT 1`;
      const stories = await sql`SELECT id FROM student_placed WHERE company_placed_id = ${id} LIMIT 1`;
      if (visits.length > 0 || stories.length > 0) {
        return res.status(400).json({ error: "Cannot delete company with existing visited stats or stories." });
      }

      const deleted = await sql`
        DELETE FROM company
        WHERE id = ${id}
        RETURNING id
      `;

      if (!deleted.length) {
        return res.status(404).json({ error: "Company not found." });
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Admin companies API error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
