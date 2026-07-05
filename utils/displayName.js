/** Placeholder identity stored when a contributor opts to stay anonymous. */
export const ANONYMOUS_PLACEHOLDER = {
  first_name: "John",
  middle_name: "",
  last_name: "Doe",
};

export function isAnonymousStory(row = {}) {
  if (row.is_anonymous) return true;

  const first = String(row.first_name ?? "").trim();
  const last = String(row.last_name ?? "").trim();
  const middle = String(row.middle_name ?? "").trim();

  return (
    first === ANONYMOUS_PLACEHOLDER.first_name &&
    last === ANONYMOUS_PLACEHOLDER.last_name &&
    !middle
  );
}

/** Public-facing name for story lists (home, browse, etc.). */
export function displayStoryName(row = {}) {
  if (isAnonymousStory(row)) return "Anonymous";

  const name = [row.first_name, row.middle_name, row.last_name]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return name || "—";
}
