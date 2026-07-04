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
        SELECT
          sp.id, sp.first_name, sp.middle_name, sp.last_name, sp.year_placed,
          sp.linkedin_url, sp.phone_number, sp.remarks_markdown,
          sp.upvote, sp.downvote, sp.company_placed_id, sp.created_at,
          c.company_name
        FROM student_placed sp
        JOIN company c ON sp.company_placed_id = c.id
        ORDER BY sp.created_at DESC, sp.id DESC
        LIMIT ${limit + 1} OFFSET ${offset};
      `;
      const hasMore = rows.length > limit;
      return res.status(200).json({ result: rows.slice(0, limit), hasMore });
    }

    if (req.method === "PUT") {
      const {
        id,
        first_name,
        middle_name,
        last_name,
        year_placed,
        company_placed_id,
        linkedin_url,
        phone_number,
        remarks_markdown,
      } = req.body || {};
      if (!id) return res.status(400).json({ error: "id is required." });

      const year = parseInt(year_placed, 10);
      if (!year || Number.isNaN(year)) {
        return res.status(400).json({ error: "A valid placement year is required." });
      }
      const companyId = parseInt(company_placed_id, 10);
      if (!companyId) return res.status(400).json({ error: "A company is required." });

      const updated = await sql`
        UPDATE student_placed SET
          first_name = ${trim(first_name)},
          middle_name = ${trim(middle_name) || ""},
          last_name = ${trim(last_name)},
          year_placed = ${year},
          company_placed_id = ${companyId},
          linkedin_url = ${trim(linkedin_url) || ""},
          phone_number = ${trim(phone_number) || null},
          remarks_markdown = ${trim(remarks_markdown)}
        WHERE id = ${id}
        RETURNING
          id, first_name, middle_name, last_name, year_placed,
          linkedin_url, phone_number, remarks_markdown,
          upvote, downvote, company_placed_id, created_at;
      `;
      if (updated.length === 0) return res.status(404).json({ error: "Not found." });

      const [company] = await sql`
        SELECT company_name FROM company WHERE id = ${companyId} LIMIT 1;
      `;
      return res
        .status(200)
        .json({ result: { ...updated[0], company_name: company?.company_name } });
    }

    if (req.method === "DELETE") {
      const id = readId(req);
      if (!id) return res.status(400).json({ error: "id is required." });
      await sql`DELETE FROM student_placed WHERE id = ${id};`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Admin contributions error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
