export const REPO_SLUG = "karthik2603-theBrogrammer/pesu-placement-tales";
export const REPO_URL = `https://github.com/${REPO_SLUG}`;

/**
 * Star count for the navbar, cached for an hour. Returns null if GitHub is unavailable.
 * GITHUB_TOKEN is optional: it raises the API rate limit and lets the count load while
 * the repository is private. Use a read-only token.
 */
export async function getRepoStars() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_SLUG}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Number.isFinite(data.stargazers_count) ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
