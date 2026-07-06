export const RECENT_DISPLAY_LIMIT = 10;

export async function fetchRecentStories(sql) {
  return sql`
    SELECT
      sp.id,
      sp.first_name,
      sp.middle_name,
      sp.last_name,
      sp.job_title,
      sp.year_placed,
      sp.batch_of,
      sp.upvote,
      sp.downvote,
      sp.created_at,
      sp.internship_fte,
      sp.internship_only,
      sp.fte_only,
      sp.summer_internship,
      sp.verdict,
      sp.is_anonymous,
      c.company_name
    FROM student_placed sp
    JOIN company c ON sp.company_placed_id = c.id
    ORDER BY sp.created_at DESC, sp.id DESC
    LIMIT ${RECENT_DISPLAY_LIMIT};
  `;
}
