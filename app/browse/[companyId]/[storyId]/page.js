"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import posthog from "posthog-js";
import { activePlacementKey } from "../../../../utils/placementType";
import { displayStoryName } from "../../../../utils/displayName";
import { companyBrowsePath } from "../../../../utils/browseRoutes";
import { useCompanyBrowse } from "../../components/CompanyBrowseLayout";
import ShareStoryButton from "../../components/ShareStoryButton";
import StoryVoteButtons from "../../components/StoryVoteButtons";
import BookmarkButton from "../../components/BookmarkButton";

const MarkdownReviewRenderer = dynamic(
  () => import("../../../components/MarkdownReviewRenderer"),
  { ssr: false }
);

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params?.storyId;
  const {
    companyId,
    companyName,
    loading,
    error,
    getStoryById,
    userVotes,
    handleVote,
    setMobileSidebarOpen,
  } = useCompanyBrowse();

  const story = getStoryById(storyId);
  const openedRef = useRef(null);

  useEffect(() => {
    if (loading || error) return;
    if (!story) {
      router.replace(companyBrowsePath(companyId));
      return;
    }

    if (openedRef.current === String(storyId)) return;
    openedRef.current = String(storyId);

    posthog.capture("story_opened", {
      student_id: story.student_id,
      company_name: companyName,
      company_id: companyId,
      job_title: story.job_title || "",
      batch_of: story.batch_of,
      year_placed: story.year_placed,
      verdict: story.verdict,
      placement_type: activePlacementKey(story) || "unknown",
      source: "route",
      page_path: `/browse/${companyId}/${storyId}`,
    });
  }, [loading, error, story, storyId, companyId, companyName, router]);

  if (loading || !story) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-amber-700">
        Loading story…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col rounded-2xl border border-amber-100 bg-white/90 shadow-sm lg:min-h-[calc(100vh-10rem)]">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-amber-100 px-3 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <Link
            href={companyBrowsePath(companyId)}
            className="text-xs font-medium text-amber-700 hover:underline lg:hidden"
          >
            ← {companyName}
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="mt-1 mx-2 inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 lg:hidden"
          >
            ☰ Stories
          </button>
          <h1 className="mt-2 text-base font-semibold leading-snug text-gray-900 sm:text-lg">
            {story.job_title
              ? `${displayStoryName(story)} · ${story.job_title}`
              : `${displayStoryName(story)}'s experience`}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <BookmarkButton storyId={story.student_id} companyId={companyId} story={story} companyName={companyName} />
          <ShareStoryButton
            companyId={companyId}
            story={story}
            companyName={companyName}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
        <MarkdownReviewRenderer remarks_markdown={story.remarks_markdown} />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-amber-100 px-4 py-3 sm:px-5">
        <span className="text-xs font-medium text-gray-500">Was this helpful?</span>
        <StoryVoteButtons
          storyId={story.student_id}
          upvote={story.upvote ?? 0}
          downvote={story.downvote ?? 0}
          userVote={userVotes[story.student_id]}
          onVote={(id, dir) => handleVote(id, dir, "reader")}
        />
      </div>
    </div>
  );
}
