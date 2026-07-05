export const DEGREE_OPTIONS = [
  { value: "CSE", label: "B.Tech CSE" },
  { value: "ECE", label: "B.Tech ECE" },
  { value: "Mech", label: "B.Tech Mech" },
  { value: "EEE", label: "B.Tech EEE" },
  { value: "AIML", label: "B.Tech AIML" },
];

export const DEFAULT_DEGREE = "CSE";

export function isValidDegree(value) {
  return DEGREE_OPTIONS.some((opt) => opt.value === value);
}

export function formatDegree(value) {
  return DEGREE_OPTIONS.find((opt) => opt.value === value)?.label ?? value ?? "—";
}
