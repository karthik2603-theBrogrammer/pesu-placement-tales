export const BROWSE_COMPANY_SOURCE_KEY = "pt_browse_company_source";

/** Mark that the next company page view came from the directory. */
export function markDirectoryCompanyNavigation() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(BROWSE_COMPANY_SOURCE_KEY, "directory");
}

/** Read and clear navigation source for PostHog (`directory` | `direct`). */
export function consumeCompanyNavigationSource() {
  if (typeof sessionStorage === "undefined") return "direct";
  const value = sessionStorage.getItem(BROWSE_COMPANY_SOURCE_KEY);
  sessionStorage.removeItem(BROWSE_COMPANY_SOURCE_KEY);
  return value === "directory" ? "directory" : "direct";
}

export function companyBrowsePath(companyId) {
  return `/browse/${companyId}`;
}

export function storyBrowsePath(companyId, storyId) {
  return `/browse/${companyId}/${storyId}`;
}

export function isStoryBrowsePath(pathname) {
  const parts = String(pathname || "")
    .split("/")
    .filter(Boolean);
  return parts[0] === "browse" && parts.length >= 3;
}
