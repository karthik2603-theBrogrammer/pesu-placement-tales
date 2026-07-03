"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { Toaster, toast } from "sonner";

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

export default function FeedbackBoard({
  title,
  eyebrow,
  description,
  endpoint,
  submitLabel,
  emptyMessage,
  fields = [],
  renderMeta,
}) {
  const initialForm = useMemo(() => buildInitialForm(fields), [fields]);
  const [formData, setFormData] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      setItems((prev) => [data.result, ...prev]);
      setFormData(initialForm);
      toast.success("Submitted successfully.");
    } catch (error) {
      console.error(`Failed to submit ${endpoint}:`, error);
      toast.error("Could not submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl">
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
                  Newest first. Updated after every submit.
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
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold leading-snug text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {item.description}
                    </p>

                    {renderMeta?.(item)}
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
