"use client";

import FeedbackBoard from "../components/FeedbackBoard";

export default function BugReportPage() {
  return (
    <FeedbackBoard
      eyebrow="Issue tracker"
      title="Bug reports"
      description="Report broken flows, UI issues, or unexpected behavior. Include enough detail so the issue can be reproduced quickly."
      endpoint="/api/bug-reports"
      submitLabel="Submit bug"
      emptyMessage="No bug reports yet. Hopefully that is good news."
      feedbackType="bug"
      fields={[
        {
          name: "reproduction_steps",
          label: "Steps to reproduce",
          placeholder: "1. Go to...\n2. Click...\n3. See...",
          type: "textarea",
          maxLength: 1600,
        },
        {
          name: "page_url",
          label: "Page URL",
          placeholder: "https://...",
          maxLength: 300,
        },
        {
          name: "reporter_name",
          label: "Your name",
          placeholder: "Optional",
          maxLength: 80,
        },
      ]}
      renderMeta={(item) => (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          {item.reproduction_steps && (
            <div>
              <p className="font-bold text-slate-800">Steps</p>
              <p className="mt-1 whitespace-pre-wrap leading-5">
                {item.reproduction_steps}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {item.page_url && (
              <a
                href={item.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline underline-offset-4"
              >
                Affected page
              </a>
            )}
            {item.reporter_name && <span>Reported by {item.reporter_name}</span>}
          </div>
        </div>
      )}
    />
  );
}
