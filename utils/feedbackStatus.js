export const FEATURE_STATUSES = [
  { value: "open", label: "Open" },
  { value: "under_consideration", label: "Under consideration" },
  { value: "in_progress", label: "In progress" },
  { value: "developed", label: "Developed" },
  { value: "rejected", label: "Rejected" },
];

export const BUG_STATUSES = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
];

export const ADMIN_REPLY_LIMIT = 800;

const LEGACY_LABELS = {
  planned: "Planned",
  done: "Developed",
  closed: "Rejected",
  completed: "Developed",
};

export function isValidFeatureStatus(value) {
  return FEATURE_STATUSES.some((s) => s.value === value);
}

export function isValidBugStatus(value) {
  return BUG_STATUSES.some((s) => s.value === value);
}

export function formatStatusLabel(status, type = "feature") {
  const options = type === "bug" ? BUG_STATUSES : FEATURE_STATUSES;
  const match = options.find((s) => s.value === status);
  if (match) return match.label;
  if (LEGACY_LABELS[status]) return LEGACY_LABELS[status];
  if (!status) return "Open";
  return status.replace(/_/g, " ");
}

export function statusBadgeClass(status, type = "feature") {
  const value = status || "open";
  if (type === "bug") {
    if (value === "resolved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (value === "investigating") return "bg-violet-50 text-violet-700 ring-violet-200";
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  if (value === "rejected" || value === "closed") {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  if (value === "developed" || value === "done" || value === "completed") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (value === "in_progress") return "bg-violet-50 text-violet-700 ring-violet-200";
  if (value === "under_consideration") return "bg-sky-50 text-sky-700 ring-sky-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

export function validateAdminReply(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > ADMIN_REPLY_LIMIT) {
    return `Admin reply must be ${ADMIN_REPLY_LIMIT} characters or fewer.`;
  }
  return null;
}
