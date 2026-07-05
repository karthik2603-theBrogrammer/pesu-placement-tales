"use client";

import FeedbackBoard from "../components/FeedbackBoard";

const voteHint = (
  <>
    Vote on ideas you want built next.{" "}
    <span className="inline-flex items-center gap-1 align-middle">
      <span
        aria-hidden
        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm"
      >
        ▲ <span className="tabular-nums">12</span>
      </span>
    </span>{" "}
    to upvote a request you care about.{" "}
    <span className="inline-flex items-center gap-1 align-middle">
      <span
        aria-hidden
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm"
      >
        ▼ <span className="tabular-nums">2</span>
      </span>
    </span>{" "}
    if it is not a priority — the list sorts by what the community wants most.
  </>
);

export default function FeatureRequestPage() {
  return (
    <FeedbackBoard
      eyebrow="Product ideas"
      title="Feature requests"
      description="Share improvements you want to see in Placement Tales. Existing requests stay visible so everyone can track what has already been suggested."
      endpoint="/api/feature-requests"
      submitLabel="Submit feature"
      emptyMessage="No feature requests yet. Add the first one."
      enableVoting
      voteHint={voteHint}
      fields={[
        {
          name: "requester_name",
          label: "Your name",
          placeholder: "Optional",
          maxLength: 80,
        },
      ]}
      renderMeta={(item) =>
        item.requester_name ? (
          <p className="mt-4 text-xs font-medium text-slate-500">
            Requested by {item.requester_name}
          </p>
        ) : null
      }
    />
  );
}
