"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@nextui-org/react";
import VerdictChip from "../VerdictChip";
import { displayStoryName } from "../../../utils/displayName";
import { formatPlacementTypes } from "../../../utils/placementType";
import { timeAgo } from "../../../utils/timeAgo";

export default function RecentStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/recent-stories");
        const data = await res.json();
        if (res.ok) setStories(data.result || []);
      } catch (error) {
        console.error("Recent stories load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-20 flex justify-center py-8">
        <Spinner color="warning" size="sm" label="Loading recent stories..." />
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <section className="relative z-10 mx-auto mt-20 w-full max-w-5xl">
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Fresh from the community
        </p>
        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Recently shared
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-amber-100/80 bg-amber-50/50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3 text-center">▲</th>
                <th className="px-4 py-3 text-center">▼</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Interview yr</th>
                <th className="px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-amber-50/80 transition hover:bg-amber-50/40 ${
                    i % 2 === 0 ? "bg-white/40" : "bg-amber-50/20"
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
                  <td className="px-4 py-3 text-center tabular-nums text-amber-700">
                    {row.upvote ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-slate-500">
                    {row.downvote ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {formatPlacementTypes(row)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {row.year_placed}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {timeAgo(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-amber-100/80 sm:hidden">
          {stories.map((row) => (
            <article key={row.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {displayStoryName(row)}
                  </p>
                  <p className="text-sm text-amber-800">
                    {row.company_name} · {row.job_title || "—"}
                  </p>
                </div>
                <VerdictChip verdict={row.verdict} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                  {formatPlacementTypes(row)}
                </span>
                <span className="text-slate-500">Interview {row.year_placed}</span>
                <span className="text-amber-700">▲ {row.upvote ?? 0}</span>
                <span className="text-slate-500">▼ {row.downvote ?? 0}</span>
                <span className="text-slate-400">{timeAgo(row.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/browse"
          className="text-sm font-semibold text-amber-700 underline-offset-4 hover:underline"
        >
          Browse through all the stories →
        </Link>
      </div>
    </section>
  );
}
