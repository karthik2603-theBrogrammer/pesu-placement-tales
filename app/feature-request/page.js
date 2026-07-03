"use client";

import FeedbackBoard from "../components/FeedbackBoard";

export default function FeatureRequestPage() {
  return (
    <FeedbackBoard
      eyebrow="Product ideas"
      title="Feature requests"
      description="Share improvements you want to see in Placement Tales. Existing requests stay visible so everyone can track what has already been suggested."
      endpoint="/api/feature-requests"
      submitLabel="Submit feature"
      emptyMessage="No feature requests yet. Add the first one."
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
