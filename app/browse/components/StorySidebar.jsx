"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { displayStoryName } from "../../../utils/displayName";
import { formatPlacementTypes } from "../../../utils/placementType";
import { storyBrowsePath } from "../../../utils/browseRoutes";
import StoryVoteButtons from "./StoryVoteButtons";
import BookmarkButton from "./BookmarkButton";
import VerdictChip from "../../components/VerdictChip";

export default function StorySidebar({
  companyId,
  stories,
  userVotes,
  onVote,
  mobileOpen,
  onCloseMobile,
}) {
  const pathname = usePathname();

  const content = (
    <nav className="flex flex-col gap-1.5 p-2" aria-label="Stories">
      {stories.map((story) => {
        const storyId = story.student_id;
        const href = storyBrowsePath(companyId, storyId);
        const active = pathname === href;

        return (
          <div
            key={storyId}
            className={`rounded-lg border transition ${
              active
                ? "border-slate-300 bg-slate-50 shadow-sm"
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
            }`}
          >
            <Link
              href={href}
              onClick={onCloseMobile}
              className="block px-3 py-2.5"
            >
              <p className="truncate text-sm font-semibold text-gray-900">
                {displayStoryName(story)}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Batch {story.batch_of ?? "—"}
                {story.job_title ? ` · ${story.job_title}` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <VerdictChip verdict={story.verdict} className="!text-[10px]" />
                <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                  {formatPlacementTypes(story)}
                </span>
              </div>
            </Link>
            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
              <StoryVoteButtons
                storyId={storyId}
                upvote={story.upvote ?? 0}
                downvote={story.downvote ?? 0}
                userVote={userVotes[storyId]}
                onVote={onVote}
                compact
              />
              <BookmarkButton
                storyId={storyId}
                companyId={companyId}
                story={story}
                compact
              />
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile drawer */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close story list"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(100%,280px)] transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:static lg:z-0 lg:w-72 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 lg:hidden">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stories
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
        </div>
      </aside>
    </>
  );
}
