"use client";

export default function StoryVoteButtons({
  storyId,
  upvote = 0,
  downvote = 0,
  userVote,
  onVote,
  compact = false,
  className = "",
}) {
  const btnClass = compact
    ? "flex items-center gap-0.5 rounded-lg border px-1.5 py-0.5 text-[10px] font-semibold transition"
    : "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition";

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onVote(storyId, "up");
        }}
        className={`${btnClass} ${
          userVote === "up"
            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
        aria-label="Upvote"
      >
        <span>▲</span>
        <span className="tabular-nums">{upvote}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onVote(storyId, "down");
        }}
        className={`${btnClass} ${
          userVote === "down"
            ? "border-slate-400 bg-slate-100 text-slate-700"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        }`}
        aria-label="Downvote"
      >
        <span>▼</span>
        <span className="tabular-nums">{downvote}</span>
      </button>
    </div>
  );
}
