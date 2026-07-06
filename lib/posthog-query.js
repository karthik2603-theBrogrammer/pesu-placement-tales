const DEFAULT_API_HOST = "https://us.posthog.com";
const QUERY_TIMEOUT_MS = 5000;

export function isPostHogQueryConfigured() {
  return Boolean(
    process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID
  );
}

/**
 * Returns a Map keyed by lowercased company name → { name, count }.
 * Returns null on any failure so callers can fall back to default sorting.
 */
export async function fetchCompanyBrowseCounts({ days = 30, limit = 100 } = {}) {
  if (!isPostHogQueryConfigured()) return null;

  const apiHost = process.env.POSTHOG_API_HOST || DEFAULT_API_HOST;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const hogql = `
    SELECT
      properties.company_name AS company_name,
      count() AS browse_clicks
    FROM events
    WHERE event = 'company_selected'
      AND timestamp >= now() - INTERVAL ${Number(days)} DAY
      AND properties.company_name != ''
    GROUP BY company_name
    ORDER BY browse_clicks DESC
    LIMIT ${Number(limit)}
  `.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${apiHost}/api/projects/${projectId}/query/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
        },
        body: JSON.stringify({
          query: { kind: "HogQLQuery", query: hogql },
          name: "company_browse_engagement",
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      console.error("PostHog query failed with status:", response.status);
      return null;
    }

    const payload = await response.json();
    const columns = payload.columns || [];
    const nameIdx = columns.indexOf("company_name");
    const countIdx = columns.indexOf("browse_clicks");
    if (nameIdx === -1 || countIdx === -1) return null;

    const counts = new Map();
    for (const row of payload.results || []) {
      const name = row[nameIdx];
      const count = Number(row[countIdx]) || 0;
      if (!name) continue;
      counts.set(String(name).toLowerCase(), { name: String(name), count });
    }

    return counts.size > 0 ? counts : null;
  } catch (error) {
    console.error("PostHog query error:", error?.name || "Error");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function browseCountForCompany(browseCounts, companyName) {
  if (!browseCounts || !companyName) return 0;
  return browseCounts.get(String(companyName).toLowerCase())?.count ?? 0;
}

function voteTotal(story) {
  return (Number(story.upvote) || 0) + (Number(story.downvote) || 0);
}

/** Sort stories by company browse clicks, then votes, then id. */
export function sortStoriesByBrowseEngagement(stories, browseCounts) {
  return [...stories].sort((a, b) => {
    const browseDiff =
      browseCountForCompany(browseCounts, b.company_name) -
      browseCountForCompany(browseCounts, a.company_name);
    if (browseDiff !== 0) return browseDiff;

    const voteDiff = voteTotal(b) - voteTotal(a);
    if (voteDiff !== 0) return voteDiff;

    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });
}
