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
    if (res.ok) {
      const data = await res.json();
      if (Number.isFinite(data.stargazers_count)) return data.stargazers_count;
    }
  } catch {
    // Fall through to the shields.io fallback.
  }

  return getStarsFromShields();
}

const SUFFIX_MULTIPLIERS = { k: 1e3, m: 1e6 };

// Unauthenticated GitHub API calls from shared build IPs can hit rate limits;
// shields.io serves the same count without that limit.
async function getStarsFromShields() {
  try {
    const res = await fetch(`https://img.shields.io/github/stars/${REPO_SLUG}.json`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const { value } = await res.json();
    const match = /^([\d.]+)\s*([km])?$/i.exec(String(value ?? "").trim());
    if (!match) return null;
    const multiplier = match[2] ? SUFFIX_MULTIPLIERS[match[2].toLowerCase()] : 1;
    return Math.round(Number(match[1]) * multiplier);
  } catch {
    return null;
  }
}
