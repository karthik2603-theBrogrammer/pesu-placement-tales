"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, SelectItem } from "@nextui-org/react";
import { FiX } from "react-icons/fi";
import { displayStoryName } from "../../../utils/displayName";
import { formatPlacementTypes, PLACEMENT_TYPE_OPTIONS } from "../../../utils/placementType";
import { formatVerdict } from "../../../utils/verdict";
import { DEGREE_OPTIONS } from "../../../utils/degree";
import { storyBrowsePath } from "../../../utils/browseRoutes";
import { useCompanyBrowse } from "../components/CompanyBrowseLayout";

export default function CompanyStoriesPage() {
  const router = useRouter();
  const { companyId, companyName, stories, loading } = useCompanyBrowse();

  const [degreeFilter, setDegreeFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Compute distinct batch years from this company's stories
  const batchOptions = useMemo(() => {
    const set = new Set();
    stories.forEach((s) => {
      if (s.batch_of) set.add(String(s.batch_of));
    });
    return Array.from(set).sort().reverse();
  }, [stories]);

  const hasActiveFilters =
    degreeFilter !== "all" ||
    batchFilter !== "all" ||
    verdictFilter !== "all" ||
    typeFilter !== "all";

  const clearFilters = () => {
    setDegreeFilter("all");
    setBatchFilter("all");
    setVerdictFilter("all");
    setTypeFilter("all");
  };

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      if (degreeFilter !== "all" && s.degree !== degreeFilter) return false;
      if (batchFilter !== "all" && String(s.batch_of) !== String(batchFilter))
        return false;
      if (verdictFilter !== "all" && s.verdict !== verdictFilter) return false;
      if (typeFilter !== "all" && !s[typeFilter]) return false;
      return true;
    });
  }, [stories, degreeFilter, batchFilter, verdictFilter, typeFilter]);

  if (loading) return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/browse"
          className="text-sm font-medium text-amber-700 hover:underline"
        >
          ← All companies
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{companyName}</h1>
        <p className="mt-1 text-sm text-amber-800">
          {hasActiveFilters
            ? `${filteredStories.length} of ${stories.length} ${stories.length === 1 ? "story" : "stories"}`
            : `${stories.length} ${stories.length === 1 ? "story" : "stories"}`}
        </p>
      </div>

      {/* Filter bar */}
      {stories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select
            aria-label="Filter by Degree"
            className="w-full sm:w-[140px]"
            placeholder="Degree"
            selectedKeys={[degreeFilter]}
            onChange={(e) => setDegreeFilter(e.target.value)}
            color="warning"
            variant="bordered"
            size="sm"
          >
            <SelectItem key="all" value="all">All Degrees</SelectItem>
            {DEGREE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            aria-label="Filter by Batch"
            className="w-full sm:w-[130px]"
            placeholder="Batch"
            selectedKeys={[batchFilter]}
            onChange={(e) => setBatchFilter(e.target.value)}
            color="warning"
            variant="bordered"
            size="sm"
          >
            <SelectItem key="all" value="all">All Batches</SelectItem>
            {batchOptions.map((b) => (
              <SelectItem key={b} value={b}>
                Batch {b}
              </SelectItem>
            ))}
          </Select>
          <Select
            aria-label="Filter by Verdict"
            className="w-full sm:w-[130px]"
            placeholder="Verdict"
            selectedKeys={[verdictFilter]}
            onChange={(e) => setVerdictFilter(e.target.value)}
            color="warning"
            variant="bordered"
            size="sm"
          >
            <SelectItem key="all" value="all">All Verdicts</SelectItem>
            <SelectItem key="selected" value="selected">Selected</SelectItem>
            <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
          </Select>
          <Select
            aria-label="Filter by Placement Type"
            className="w-full sm:w-[160px]"
            placeholder="Type"
            selectedKeys={[typeFilter]}
            onChange={(e) => setTypeFilter(e.target.value)}
            color="warning"
            variant="bordered"
            size="sm"
          >
            <SelectItem key="all" value="all">All Types</SelectItem>
            {PLACEMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <FiX size={12} />
              Clear
            </button>
          )}
        </div>
      )}

      {filteredStories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center text-sm text-gray-500">
          {hasActiveFilters
            ? "No stories match your filters."
            : "No stories yet for this company."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((item) => (
            <button
              key={item.student_id}
              type="button"
              onClick={() =>
                router.push(storyBrowsePath(companyId, item.student_id))
              }
              className="group rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {displayStoryName(item)}
                  </p>
                  {item.job_title && (
                    <p className="truncate text-xs text-amber-700">{item.job_title}</p>
                  )}
                </div>
                <span className="shrink-0 tabular-nums text-[10px] leading-tight text-slate-400">
                  <span className="text-amber-600">▲{item.upvote ?? 0}</span>
                  {" · "}
                  <span>▼{item.downvote ?? 0}</span>
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] leading-tight text-slate-500">
                <span className="font-medium text-amber-800">
                  {formatPlacementTypes(item)}
                </span>
                <span className="text-amber-300"> · </span>
                Batch {item.batch_of}
                <span className="text-amber-300"> · </span>
                <span
                  className={
                    item.verdict === "rejected"
                      ? "font-medium text-red-600"
                      : "font-medium text-emerald-600"
                  }
                >
                  {formatVerdict(item.verdict)}
                </span>
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
