"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import { CiSearch } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import Link from "next/link";
import { displayStoryName } from "../../utils/displayName";
import { formatPlacementTypes } from "../../utils/placementType";
import { storyBrowsePath } from "../../utils/browseRoutes";
import { timeAgo } from "../../utils/timeAgo";
import VerdictChip from "../components/VerdictChip";
import BrowseShell from "../browse/components/BrowseShell";

export default function SearchPage() {
  return (
    <BrowseShell>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Spinner color="warning" /></div>}>
        <SearchPageInner />
      </Suspense>
    </BrowseShell>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const performSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(data.result || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      performSearch(trimmed);
    } else {
      router.push(`/search`);
      setResults([]);
      setSearched(false);
    }
  };

  // Search from URL param on mount
  useEffect(() => {
    if (initialQuery) performSearch(initialQuery);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const openStory = (row) => {
    router.push(storyBrowsePath(row.company_id, row.student_id));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 w-fit rounded-full border border-amber-200 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
          Search
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Search Stories
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Search across all placement stories — find interview rounds, topics,
          companies, roles, and more.
        </p>
      </div>

      {/* Search input form */}
      <form onSubmit={handleSubmit} className="relative mb-6 flex max-w-2xl gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <CiSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "system design", "HR round", "DSA"...'
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
                router.push("/search");
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-amber-100 bg-white/70 p-10 shadow-sm">
          <Spinner color="warning" labelColor="warning" className="text-xs">
            Searching...
          </Spinner>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            No stories match &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try different keywords or a shorter search term.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white/75 shadow-sm backdrop-blur">
          <div className="border-b border-amber-100 px-5 py-3">
            <p className="text-xs font-semibold text-slate-600">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-amber-100/80 bg-amber-50/50 text-xs font-semibold uppercase tracking-wide text-amber-700">
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
                {results.map((row, i) => (
                  <tr
                    key={row.student_id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openStory(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openStory(row);
                      }
                    }}
                    className={`cursor-pointer border-b border-amber-50/80 transition hover:bg-amber-50/40 ${
                      i % 2 === 0 ? "bg-white/40" : "bg-amber-50/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {displayStoryName(row)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.company_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.job_title || "—"}
                    </td>
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

          {/* Mobile cards */}
          <div className="divide-y divide-amber-100/80 sm:hidden">
            {results.map((row) => (
              <button
                key={row.student_id}
                type="button"
                onClick={() => openStory(row)}
                className="block w-full px-4 py-4 text-left active:bg-amber-50/60"
              >
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
                  <span className="text-slate-500">
                    Batch {row.batch_of}
                  </span>
                  <span className="text-amber-700">
                    ▲ {row.upvote ?? 0}
                  </span>
                  <span className="text-slate-500">
                    ▼ {row.downvote ?? 0}
                  </span>
                  <span className="text-slate-400">
                    {timeAgo(row.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Initial state — no search yet */
        <div className="rounded-2xl border border-amber-100 bg-white/70 p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-100">
            <CiSearch className="text-amber-600" size={24} />
          </div>
          <p className="text-sm text-slate-500">
            Type at least 2 characters to search across all placement stories.
          </p>
        </div>
      )}
    </div>
  );
}
