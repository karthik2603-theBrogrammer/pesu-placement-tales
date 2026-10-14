"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { displayStoryName } from "../../../utils/displayName";
import { formatPlacementTypes } from "../../../utils/placementType";
import { formatVerdict } from "../../../utils/verdict";
import { storyBrowsePath } from "../../../utils/browseRoutes";
import { useCompanyBrowse } from "../components/CompanyBrowseLayout";

export default function CompanyStoriesPage() {
  const router = useRouter();
  const { companyId, companyName, stories, loading } = useCompanyBrowse();

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
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </p>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center text-sm text-gray-500">
          No stories yet for this company.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((item) => (
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
