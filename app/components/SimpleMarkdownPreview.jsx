"use client";

/** Lightweight read-only markdown preview — avoids BlockNote chunk load issues. */
export default function SimpleMarkdownPreview({ markdown, className = "story-markdown" }) {
  if (!markdown?.trim()) return null;

  const lines = markdown.split("\n");
  const blocks = [];
  let listBuffer = [];

  const flushList = () => {
    if (!listBuffer.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-2 list-disc space-y-1 pl-5">
        {listBuffer}
      </ul>
    );
    listBuffer = [];
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return parts.map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const nestedBullet = line.match(/^(\s+)-\s+(.*)$/);
    const topBullet = trimmed.match(/^-\s+(.*)$/);
    const h1 = trimmed.match(/^#\s+(.*)$/);
    const h2 = trimmed.match(/^##\s+(.*)$/);
    const h3 = trimmed.match(/^###\s+(.*)$/);

    if (h1) {
      flushList();
      blocks.push(
        <h1 key={`h1-${i}`} className="mb-2 mt-4 first:mt-0">
          {renderInline(h1[1])}
        </h1>
      );
      continue;
    }
    if (h2) {
      flushList();
      blocks.push(
        <h2 key={`h2-${i}`} className="mb-2 mt-4 first:mt-0">
          {renderInline(h2[1])}
        </h2>
      );
      continue;
    }
    if (h3) {
      flushList();
      blocks.push(
        <h3 key={`h3-${i}`} className="mb-2 mt-3 first:mt-0">
          {renderInline(h3[1])}
        </h3>
      );
      continue;
    }

    const bulletText = nestedBullet?.[2] || topBullet?.[1];
    if (bulletText) {
      const indent = nestedBullet ? "ml-4" : "";
      listBuffer.push(
        <li key={`li-${i}`} className={`leading-relaxed text-slate-700 ${indent}`}>
          {renderInline(bulletText)}
        </li>
      );
      continue;
    }

    flushList();
    blocks.push(
      <p key={`p-${i}`} className="my-2 leading-relaxed text-slate-700">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`${className} min-w-0 overflow-x-hidden`}>{blocks}</div>;
}
