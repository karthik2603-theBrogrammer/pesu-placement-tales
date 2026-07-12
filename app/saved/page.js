"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBookmark } from "react-icons/fa";
import { displayStoryName } from "../../utils/displayName";
import { formatPlacementTypes } from "../../utils/placementType";
import { storyBrowsePath } from "../../utils/browseRoutes";
import { loadBookmarks, toggleBookmark } from "../../utils/bookmarks";
import VerdictChip from "../components/VerdictChip";
import BrowseShell from "../browse/components/BrowseShell";

export default function SavedStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStories(loadBookmarks());
    setLoaded(true);
  }, []);

  const handleRemove = (storyId, companyId) => {
    toggleBookmark(storyId, companyId);
    setStories((prev) =>
      prev.filter((b) => String(b.storyId) !== String(storyId))
    );
  };

  return (
    <BrowseShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 w-fit rounded-full border border-amber-200 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
            Your collection
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Saved Stories
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Stories you&apos;ve bookmarked for quick reference. Saved locally in
            your browser.
          </p>
        </div>

        {!loaded ? null : stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-amber-100 shadow-sm">
              <FaBookmark className="text-amber-600" size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No saved stories yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Browse stories and tap the bookmark icon to save them here for
              quick reference later.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
            >
              Browse stories
            </Link>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-amber-100 bg-white/75 p-4 shadow-sm backdrop-blur md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your bookmarks
                </h2>
                <p className="text-xs text-gray-500">
                  {stories.length}{" "}
                  {stories.length === 1 ? "story" : "stories"} saved
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((item) => (
                <div
                  key={item.storyId}
                  className="group relative rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        storyBrowsePath(item.companyId, item.storyId)
                      )
                    }
                    className="block w-full text-left focus:outline-none"
                  >
                    <p className="text-xs font-semibold text-amber-700">
                      {item.company_name}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                      {displayStoryName(item)}
                    </p>
                    {item.job_title && (
                      <p className="truncate text-xs text-amber-700">
                        {item.job_title}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <VerdictChip
                        verdict={item.verdict}
                        className="!text-[10px]"
                      />
                      <span className="rounded-full bg-amber-100/80 px-1.5 py-0.5 font-medium text-amber-800">
                        {formatPlacementTypes(item)}
                      </span>
                      <span>Batch {item.batch_of}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px]">
                      <span className="text-amber-700">
                        ▲ {item.upvote ?? 0}
                      </span>
                      <span className="text-slate-400">
                        ▼ {item.downvote ?? 0}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.storyId, item.companyId)}
                    className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
                    aria-label="Remove bookmark"
                    title="Remove bookmark"
                  >
                    <FaBookmark size={13} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BrowseShell>
  );
}
