export const PLACEMENT_TYPE_OPTIONS = [
  { key: "internship_fte", label: "Intern + FTE" },
  { key: "internship_only", label: "Intern Only" },
  { key: "fte_only", label: "FTE Only" },
  { key: "summer_internship", label: "Summer Internship" },
];

/** Returns human labels for whichever placement flags are true. */
export function placementTypeLabels(row = {}) {
  return PLACEMENT_TYPE_OPTIONS.filter((opt) => row[opt.key]).map(
    (opt) => opt.label
  );
}

export function formatPlacementTypes(row = {}) {
  const labels = placementTypeLabels(row);
  return labels.length ? labels.join(", ") : "—";
}

export function hasPlacementType(row = {}) {
  return PLACEMENT_TYPE_OPTIONS.some((opt) => row[opt.key]);
}
