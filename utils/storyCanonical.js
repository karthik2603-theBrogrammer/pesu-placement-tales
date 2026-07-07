import { getDb, isDbConfigured } from "./db";
import { storyBrowsePath } from "./browseRoutes";

/** Resolve canonical browse path for a student story id, or null. */
export async function getStoryBrowsePath(studentId) {
  const id = parseInt(studentId, 10);
  if (!id || Number.isNaN(id) || !isDbConfigured()) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT company_placed_id
    FROM student_placed
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!rows.length || !rows[0].company_placed_id) return null;
  return storyBrowsePath(rows[0].company_placed_id, id);
}
