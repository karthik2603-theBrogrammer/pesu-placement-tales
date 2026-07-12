const BOOKMARKS_KEY = "pt_bookmarks";

/**
 * Load all bookmarks from localStorage.
 * Each entry stores the full story summary so the /saved page needs no API call.
 */
export function loadBookmarks() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Save the bookmarks array to localStorage. */
function saveBookmarks(bookmarks) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

/** Check if a story is bookmarked. */
export function isBookmarked(storyId) {
  return loadBookmarks().some((b) => String(b.storyId) === String(storyId));
}

/**
 * Toggle a bookmark for the given story.
 * `storyData` should contain the display fields (name, company, job title, etc.)
 * so the /saved page can render without an API call.
 *
 * @param {number} storyId
 * @param {number} companyId
 * @param {object} [storyData] — summary fields to persist (ignored on remove)
 * @returns {{ bookmarked: boolean }}
 */
export function toggleBookmark(storyId, companyId, storyData = {}) {
  const bookmarks = loadBookmarks();
  const idx = bookmarks.findIndex(
    (b) => String(b.storyId) === String(storyId)
  );

  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    saveBookmarks(bookmarks);
    return { bookmarked: false };
  }

  bookmarks.unshift({
    storyId: Number(storyId),
    companyId: Number(companyId),
    savedAt: new Date().toISOString(),
    // Store display-ready summary fields
    first_name: storyData.first_name ?? "",
    middle_name: storyData.middle_name ?? "",
    last_name: storyData.last_name ?? "",
    is_anonymous: storyData.is_anonymous ?? false,
    company_name: storyData.company_name ?? "",
    job_title: storyData.job_title ?? "",
    batch_of: storyData.batch_of ?? "",
    verdict: storyData.verdict ?? "selected",
    degree: storyData.degree ?? "",
    upvote: storyData.upvote ?? 0,
    downvote: storyData.downvote ?? 0,
    internship_fte: storyData.internship_fte ?? false,
    internship_only: storyData.internship_only ?? false,
    fte_only: storyData.fte_only ?? false,
    summer_internship: storyData.summer_internship ?? false,
  });
  saveBookmarks(bookmarks);
  return { bookmarked: true };
}
