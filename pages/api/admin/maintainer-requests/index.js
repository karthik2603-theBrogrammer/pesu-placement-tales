import { DB_CONFIG_ERROR, getDb, isDbConfigured } from "../../../../utils/db";
import { readId, readPagination, requireAdmin } from "../../../../utils/adminAuth";

const MAINTAINER_SCHEMA = `
  CREATE TABLE IF NOT EXISTS maintainer_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    batch VARCHAR(20) NOT NULL,
    department VARCHAR(120) NOT NULL,
    degree VARCHAR(120) NOT NULL,
    linkedin_url TEXT NOT NULL,
    email VARCHAR(180) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default async function handler(req, res) {
  if (!isDbConfigured()) return res.status(503).json({ error: DB_CONFIG_ERROR });
  if (!requireAdmin(req, res)) return;

  const sql = getDb();

  try {
    await sql(MAINTAINER_SCHEMA);

    if (req.method === "GET") {
      const { limit, offset } = readPagination(req);
      const rows = await sql`
        SELECT
          id,
          full_name,
          batch,
          department,
          degree,
          linkedin_url,
          email,
          reason,
          created_at
        FROM maintainer_requests
        ORDER BY created_at DESC
        LIMIT ${limit + 1} OFFSET ${offset};
      `;
      const hasMore = rows.length > limit;
      return res.status(200).json({ result: rows.slice(0, limit), hasMore });
    }

    if (req.method === "PUT") {
      const {
        id,
        full_name,
        batch,
        department,
        degree,
        linkedin_url,
        email,
        reason,
      } = req.body || {};
      if (!id) return res.status(400).json({ error: "id is required." });

      const updated = await sql`
        UPDATE maintainer_requests SET
          full_name = ${trim(full_name)},
          batch = ${trim(batch)},
          department = ${trim(department)},
          degree = ${trim(degree)},
          linkedin_url = ${trim(linkedin_url)},
          email = ${trim(email)},
          reason = ${trim(reason) || null}
        WHERE id = ${id}
        RETURNING
          id,
          full_name,
          batch,
          department,
          degree,
          linkedin_url,
          email,
          reason,
          created_at;
      `;
      if (updated.length === 0) return res.status(404).json({ error: "Not found." });
      return res.status(200).json({ result: updated[0] });
    }

    if (req.method === "DELETE") {
      const id = readId(req);
      if (!id) return res.status(400).json({ error: "id is required." });
      await sql`DELETE FROM maintainer_requests WHERE id = ${id};`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Admin maintainer-requests error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
