const UNITS = [
  { limit: 60, divisor: 1, unit: "s" },
  { limit: 3600, divisor: 60, unit: "m" },
  { limit: 86400, divisor: 3600, unit: "h" },
  { limit: 604800, divisor: 86400, unit: "d" },
  { limit: Infinity, divisor: 604800, unit: "w" },
];

/** Compact relative time, e.g. "2s ago", "3h ago". */
export function timeAgo(value) {
  if (!value) return "just now";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "just now";

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 10) return "just now";

  for (const { limit, divisor, unit } of UNITS) {
    if (seconds < limit) {
      const n = Math.floor(seconds / divisor) || 1;
      return `${n}${unit} ago`;
    }
  }
  return "just now";
}
