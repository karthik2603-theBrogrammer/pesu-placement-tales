import { formatVerdict } from "../../utils/verdict";

const STYLES = {
  selected:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export default function VerdictChip({ verdict, className = "" }) {
  const key = verdict === "rejected" ? "rejected" : "selected";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[key]} ${className}`}
    >
      {formatVerdict(verdict)}
    </span>
  );
}
