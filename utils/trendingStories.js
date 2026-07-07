import {
  fetchCompanyBrowseCounts,
  sortStoriesByBrowseEngagement,
} from "../lib/posthog-query";

export const TRENDING_POOL_LIMIT = 50;
export const TRENDING_DISPLAY_LIMIT = 10;

export async function fetchTrendingStoriesPool(sql) {
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
      sp.company_placed_id AS company_id,
      c.company_name
    FROM student_placed sp
    JOIN company c ON sp.company_placed_id = c.id
    ORDER BY (COALESCE(sp.upvote, 0) + COALESCE(sp.downvote, 0)) DESC, sp.id DESC
    LIMIT ${TRENDING_POOL_LIMIT};
  `;
}

/**
 * Loads trending stories. Uses PostHog company browse counts when available;
 * otherwise keeps the default vote-based order from the DB.
 */
export async function getTrendingStories(sql) {
  const [pool, browseCounts] = await Promise.all([
    fetchTrendingStoriesPool(sql),
    fetchCompanyBrowseCounts(),
  ]);

  if (!browseCounts) {
    return {
      result: pool.slice(0, TRENDING_DISPLAY_LIMIT),
      sortBy: "votes",
    };
  }

  const sorted = sortStoriesByBrowseEngagement(pool, browseCounts);
  return {
    result: sorted.slice(0, TRENDING_DISPLAY_LIMIT),
    sortBy: "browse",
  };
}
