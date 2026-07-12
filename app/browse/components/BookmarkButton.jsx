"use client";

import { useCallback, useEffect, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { toast } from "sonner";
import posthog from "posthog-js";
import { isBookmarked, toggleBookmark } from "../../../utils/bookmarks";

/**
 * @param {object} props
 * @param {number} props.storyId
 * @param {number} props.companyId
 * @param {object} [props.story] — full story object so we can persist summary fields
 * @param {string} [props.companyName] — company name (may come from context)
 * @param {boolean} [props.compact]
 * @param {string} [props.className]
 */
export default function BookmarkButton({
  storyId,
  companyId,
  story,
  companyName,
  compact = false,
  className = "",
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(storyId));
  }, [storyId]);

  const handleToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { bookmarked } = toggleBookmark(storyId, companyId, {
        ...story,
        company_name: companyName || story?.company_name || "",
      });
      setSaved(bookmarked);
      toast.success(bookmarked ? "Story saved" : "Bookmark removed");
      posthog.capture(bookmarked ? "story_bookmarked" : "story_unbookmarked", {
        student_id: storyId,
        company_id: companyId,
      });
    },
    [storyId, companyId, story, companyName]
  );

  const Icon = saved ? FaBookmark : FaRegBookmark;
  const label = saved ? "Remove bookmark" : "Save story";

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`rounded-lg p-1 transition ${
          saved
            ? "text-amber-600 hover:text-amber-700"
            : "text-slate-400 hover:text-amber-500"
        } ${className}`}
        aria-label={label}
        title={label}
      >
        <Icon size={12} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`rounded-lg p-1.5 transition ${
        saved
          ? "text-amber-600 hover:text-amber-700"
          : "text-slate-400 hover:text-amber-500"
      } ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon size={15} aria-hidden />
    </button>
  );
}
