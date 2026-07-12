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
            className={`rounded-xl border transition ${
              active
                ? "border-amber-300 bg-amber-50 shadow-sm"
                : "border-amber-100/80 bg-white/80 hover:border-amber-200 hover:bg-amber-50/70"
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
              <p className="mt-0.5 truncate text-xs text-amber-800">
                Batch {story.batch_of ?? "—"}
                {story.job_title ? ` · ${story.job_title}` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <VerdictChip verdict={story.verdict} className="!text-[10px]" />
                <span className="rounded-full bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                  {formatPlacementTypes(story)}
                </span>
              </div>
            </Link>
            <div className="border-t border-amber-100/80 px-3 py-2 flex items-center justify-between">
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
        className={`fixed inset-y-0 left-0 z-50 w-[min(100%,280px)] transform border-r border-amber-100 bg-white/95 shadow-xl backdrop-blur transition-transform duration-200 lg:static lg:z-0 lg:w-72 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-amber-100 px-3 py-3 lg:hidden">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Stories
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50"
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
