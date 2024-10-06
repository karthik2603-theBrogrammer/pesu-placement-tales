import React, { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

const MarkdownReviewRenderer = ({ remarks_markdown }) => {
  const editor = useCreateBlockNote(); // Initialize the BlockNote editor

  useEffect(() => {
    // Async function to parse the markdown and update the editor content
    const parseMarkdown = async () => {
      if (remarks_markdown) {
        const blocks = await editor.tryParseMarkdownToBlocks(remarks_markdown);
        editor.replaceBlocks(editor.document, blocks); // Replace blocks in the editor
      }
    };

    parseMarkdown(); // Call the async function
  }, [remarks_markdown, editor]); // Dependencies: run when remarks_markdown or editor changes

  return (
    <div>
      <BlockNoteView editor={editor} editable={false} theme="light" />
    </div>
  );
};

export default MarkdownReviewRenderer;
