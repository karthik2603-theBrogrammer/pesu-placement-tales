"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { Toaster, toast } from "sonner";
import posthog from "posthog-js";
import {
  formatStatusLabel,
  statusBadgeClass,
} from "../../utils/feedbackStatus";

const FEATURE_VOTES_KEY = "pt_feature_votes";

function formatDate(value) {
  if (!value) return "Just now";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildInitialForm(fields) {
  return fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: "",
    }),
    { title: "", description: "" }
  );
}

function VoteButtons({ item, userVote, onVote }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => onVote(item.id, "up")}
        aria-label="Upvote"
        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold shadow-sm transition ${
          userVote === "up"
            ? "border-amber-300 bg-amber-100 text-amber-800"
            : "border-amber-200 bg-white text-amber-700 hover:border-amber-300 hover:bg-amber-50"
        }`}
      >
        ▲ <span className="tabular-nums">{item.upvote ?? 0}</span>
      </button>
      <button
        type="button"
        onClick={() => onVote(item.id, "down")}
        aria-label="Downvote"
        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold shadow-sm transition ${
          userVote === "down"
            ? "border-slate-300 bg-slate-100 text-slate-700"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        ▼ <span className="tabular-nums">{item.downvote ?? 0}</span>
      </button>
    </div>
  );
}

function StatusBadge({ status, feedbackType }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusBadgeClass(status, feedbackType)}`}
    >
      {formatStatusLabel(status, feedbackType)}
    </span>
  );
}

function AdminReply({ text }) {
  if (!text?.trim()) return null;
  return (
    <div className="mt-3 border-t border-amber-100/80 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-600">
        Team response
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
        {text}
      </p>
    </div>
  );
}

export default function FeedbackBoard({
  title,
  eyebrow,
  description,
  endpoint,
  submitLabel,
  emptyMessage,
  fields = [],
  renderMeta,
  enableVoting = false,
  voteEndpoint = "/api/vote-feature-request",
  voteHint,
  feedbackType = "feature",
}) {
  const initialForm = useMemo(() => buildInitialForm(fields), [fields]);
  const [formData, setFormData] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState({});

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!enableVoting) return;
    try {
      const stored = JSON.parse(localStorage.getItem(FEATURE_VOTES_KEY) || "{}");
      setUserVotes(stored);
    } catch {
      setUserVotes({});
    }
  }, [enableVoting]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Could not load entries.");
        setItems([]);
        return;
      }

      setItems(Array.isArray(data.result) ? data.result : []);
    } catch (error) {
      console.error(`Failed to load ${endpoint}:`, error);
      toast.error("Could not load entries.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [endpoint]);

  const handleVote = async (id, target) => {
    const prev = userVotes[id];
    let upDelta = 0;
    let downDelta = 0;
    let next = prev;

    if (target === "up") {
      if (prev === "up") {
        upDelta = -1;
        next = undefined;
      } else if (prev === "down") {
        upDelta = 1;
        downDelta = -1;
        next = "up";
      } else {
        upDelta = 1;
        next = "up";
      }
    } else if (prev === "down") {
      downDelta = -1;
      next = undefined;
    } else if (prev === "up") {
      downDelta = 1;
      upDelta = -1;
      next = "down";
    } else {
      downDelta = 1;
      next = "down";
    }

    try {
      const response = await fetch(voteEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, upDelta, downDelta }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vote failed.");

      setItems((list) =>
        list.map((item) =>
          item.id === id
            ? { ...item, upvote: data.upvote, downvote: data.downvote }
            : item
        )
      );

      posthog.capture('feedback_voted', {
        item_id: id,
        vote_direction: target,
        endpoint,
      });

      const nextVotes = { ...userVotes };
      if (next) nextVotes[id] = next;
      else delete nextVotes[id];
      setUserVotes(nextVotes);
      localStorage.setItem(FEATURE_VOTES_KEY, JSON.stringify(nextVotes));
    } catch (error) {
      console.error("Feature vote error:", error);
      toast.error(error.message || "Could not register your vote.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Could not submit.");
        return;
      }

      const created = {
        ...data.result,
        upvote: data.result?.upvote ?? 0,
        downvote: data.result?.downvote ?? 0,
      };
      setItems((prev) => [created, ...prev]);
      setFormData(initialForm);
      toast.success("Submitted successfully.");

      const isBugReport = endpoint.includes('bug-report');
      posthog.capture(isBugReport ? 'bug_report_submitted' : 'feature_request_submitted', {
        endpoint,
        title: formData.title,
      });
    } catch (error) {
      console.error(`Failed to submit ${endpoint}:`, error);
      toast.error("Could not submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(180,83,9,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(180,83,9,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_95%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0.35))]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
          {enableVoting && voteHint && (
            <div className="mt-4 max-w-2xl rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-3">
              <p className="text-sm leading-relaxed text-slate-600">{voteHint}</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-amber-950">Submit</h2>
              <p className="mt-1 text-xs text-slate-500">
                Keep it clear. We keep it visible.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                name="title"
                label="Title"
                placeholder="Short summary"
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
                maxLength={140}
                color="warning"
                variant="bordered"
                isRequired
              />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  name="description"
                  placeholder="What should we know?"
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  maxLength={1200}
                  required
                  className="min-h-[130px] w-full resize-y rounded-2xl border border-amber-100 bg-white/80 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </label>

              {fields.map((field) =>
                field.type === "textarea" ? (
                  <label key={field.name} className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      {field.label}
                    </span>
                    <textarea
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
                      maxLength={field.maxLength}
                      className="min-h-[110px] w-full resize-y rounded-2xl border border-amber-100 bg-white/80 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                  </label>
                ) : (
                  <Input
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    maxLength={field.maxLength}
                    color="warning"
                    variant="bordered"
                  />
                )
              )}

              <Button
                type="submit"
                color="warning"
                variant="shadow"
                className="w-full bg-amber-500 text-white shadow-lg shadow-amber-200"
                isLoading={submitting}
              >
                {submitLabel}
              </Button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-amber-950">
                  Previous submissions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {enableVoting
                    ? "Sorted by community votes. Tap ▲ or ▼ to weigh in."
                    : "Newest first. Updated after every submit."}
                </p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {items.length}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner color="default" label="Loading..." />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-8 text-center">
                <p className="text-sm text-slate-500">{emptyMessage}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/60 hover:shadow-md"
                  >
                    <div className="flex gap-3">
                      {enableVoting && (
                        <VoteButtons
                          item={item}
                          userVote={userVotes[item.id]}
                          onVote={handleVote}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold leading-snug text-slate-950">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(item.created_at)}
                            </p>
                          </div>
                          <StatusBadge status={item.status} feedbackType={feedbackType} />
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {item.description}
                        </p>

                        {renderMeta?.(item)}

                        <AdminReply text={item.admin_reply} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
