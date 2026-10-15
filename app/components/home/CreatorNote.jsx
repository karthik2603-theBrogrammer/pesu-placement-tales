// Edit NOTE_PARAGRAPHS to write your note. Each string is one paragraph.
const NOTE_PARAGRAPHS = [
  "A personal note from the creator is coming soon. Check back shortly!",
];
const SIGNATURE = "Karthik Namboori";
const SIGNATURE_ROLE = "Creator, PESU Placement Tales";

export default function CreatorNote() {
  return (
    <section
      aria-labelledby="creator-note-heading"
      className="relative z-10 mx-auto mt-14 max-w-3xl"
    >
      <div className="rounded-2xl border border-amber-200/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="mb-3 w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
          From the creator
        </p>
        <h2 id="creator-note-heading" className="text-xl font-black tracking-tight text-amber-950 sm:text-2xl">
          A note from the creator
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
          {NOTE_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-5 text-sm font-semibold text-amber-800">
          — {SIGNATURE}
          <span className="block text-xs font-medium text-slate-500">{SIGNATURE_ROLE}</span>
        </p>
      </div>
    </section>
  );
}
