"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import VerdictChip from "../VerdictChip";
import { displayStoryName } from "../../../utils/displayName";
import { formatPlacementTypes } from "../../../utils/placementType";
import { timeAgo } from "../../../utils/timeAgo";
import { storyBrowsePath } from "../../../utils/browseRoutes";

function storyHref(row) {
  if (!row?.company_id || !row?.id) return null;
  return storyBrowsePath(row.company_id, row.id);
}

export default function StoryFeedSection({
  eyebrow,
  title,
  stories,
  showBrowseLink = false,
  className = "mt-20",
}) {
  const router = useRouter();

  if (!stories.length) return null;

  const openStory = (row) => {
    const href = storyHref(row);
    if (href) router.push(href);
  };

  const rowKeyDown = (event, row) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openStory(row);
  };

  return (
    <section className={`relative z-10 mx-auto w-full max-w-5xl ${className}`}>
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-serif font-black tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3 text-center">▲</th>
                <th className="px-4 py-3 text-center">▼</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((row, i) => (
                <tr
                  key={row.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openStory(row)}
                  onKeyDown={(event) => rowKeyDown(event, row)}
                  className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {displayStoryName(row)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.company_name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.job_title || "—"}</td>
                  <td className="px-4 py-3">
                    <VerdictChip verdict={row.verdict} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-indigo-700">
                    {row.upvote ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-500">
                    {row.downvote ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {formatPlacementTypes(row)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {row.batch_of}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {timeAgo(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 sm:hidden">
          {stories.map((row) => {
            const href = storyHref(row);
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {displayStoryName(row)}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {row.company_name} · {row.job_title || "—"}
                    </p>
                  </div>
                  <VerdictChip verdict={row.verdict} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                    {formatPlacementTypes(row)}
                  </span>
                  <span className="text-slate-500">Batch {row.batch_of}</span>
                  <span className="text-indigo-600">▲ {row.upvote ?? 0}</span>
                  <span className="text-slate-500">▼ {row.downvote ?? 0}</span>
                  <span className="text-slate-400">{timeAgo(row.created_at)}</span>
                </div>
              </>
            );

            return href ? (
              <Link key={row.id} href={href} className="block px-4 py-4 active:bg-slate-50">
                {content}
              </Link>
            ) : (
              <article key={row.id} className="px-4 py-4">
                {content}
              </article>
            );
          })}
        </div>
      </div>

      {showBrowseLink ? (
        <div className="mt-6 text-center">
          <Link
            href="/browse"
            className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline"
          >
            Browse through all the stories →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
