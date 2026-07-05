export const VERDICT_OPTIONS = [
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

export const ROUND_OUTCOME_OPTIONS = VERDICT_OPTIONS;

export function isValidVerdict(value) {
  return value === "selected" || value === "rejected";
}

/** Human label; unknown/null defaults to Selected (legacy rows). */
export function formatVerdict(value) {
  if (value === "rejected") return "Rejected";
  return "Selected";
}

export function formatRoundOutcome(value) {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (text === "rejected") return "Rejected";
  if (text === "selected") return "Selected";
  return typeof value === "string" ? value.trim() : "";
}
