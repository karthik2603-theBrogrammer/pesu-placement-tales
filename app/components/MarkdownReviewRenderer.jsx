"use client";

import SimpleMarkdownPreview from "./SimpleMarkdownPreview";

/** Read-only placement story markdown (browse, review, admin). */
export default function MarkdownReviewRenderer({ remarks_markdown, theme: _theme }) {
  return <SimpleMarkdownPreview markdown={remarks_markdown} />;
}
