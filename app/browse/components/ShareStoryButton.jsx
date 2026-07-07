"use client";

import posthog from "posthog-js";
import { FaLink } from "react-icons/fa";
import { toast } from "sonner";
import { activePlacementKey } from "../../../utils/placementType";
import { storyBrowsePath } from "../../../utils/browseRoutes";

export default function ShareStoryButton({
  companyId,
  story,
  companyName,
  className = "rounded-lg p-1.5 text-amber-600 hover:bg-amber-50",
  size = 15,
}) {
  const storyId = story?.student_id ?? story?.id;

  const handleCopy = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!storyId || !companyId) return;

    const url = `${window.location.origin}${storyBrowsePath(companyId, storyId)}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Story link copied to clipboard.");

      posthog.capture("story_link_shared", {
        student_id: storyId,
        company_name: companyName,
        company_id: companyId,
        job_title: story.job_title || "",
        batch_of: story.batch_of,
        year_placed: story.year_placed,
        verdict: story.verdict,
        placement_type: activePlacementKey(story) || "unknown",
        share_url: url,
        copy_method: "clipboard",
      });
    } catch (error) {
      console.error("Copy story link error:", error);
      toast.error("Could not copy link.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      aria-label="Copy story link"
      title="Copy story link"
    >
      <FaLink size={size} aria-hidden />
    </button>
  );
}
