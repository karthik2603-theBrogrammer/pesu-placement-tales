"use client";

import React, { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

const MarkdownReviewRenderer = ({ remarks_markdown, theme }) => {
  const editor = useCreateBlockNote();
  const [fallback, setFallback] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const parseMarkdown = async () => {
      if (!remarks_markdown) {
        setFallback(null);
        return;
      }

      try {
        const blocks = await editor.tryParseMarkdownToBlocks(remarks_markdown);
        if (cancelled) return;
        editor.replaceBlocks(editor.document, blocks);
        setFallback(null);
      } catch (error) {
        console.error("Markdown render failed:", error);
        if (!cancelled) setFallback(remarks_markdown);
      }
    };

    parseMarkdown();
    return () => {
      cancelled = true;
    };
  }, [remarks_markdown, editor]);

  if (fallback) {
    return (
      <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {fallback}
      </div>
    );
  }

  return (
    <div>
      <BlockNoteView
        editor={editor}
        editable={false}
        theme={theme || "light"}
        defaultValue="Hold On..."
      />
    </div>
  );
};

export default MarkdownReviewRenderer;
