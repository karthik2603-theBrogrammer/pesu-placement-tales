"use client";

import { useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { TextArea, TextField } from "../components/contribute/fields";

const INITIAL_FORM = {
  full_name: "",
  batch: "",
  department: "",
  degree: "",
  linkedin_url: "",
  email: "",
  reason: "",
};

export default function PassTheTorchPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      ["full_name", "Full name"],
      ["batch", "Batch"],
      ["degree", "Degree"],
      ["department", "Department"],
      ["email", "Email"],
      ["linkedin_url", "LinkedIn URL"],
      ["reason", "Why do you want access?"],
    ];
    for (const [key, label] of required) {
      if (!form[key]?.trim()) {
        toast.error(`Please fill in ${label}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/maintainer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Submission failed.");

      toast.success("Request sent! We'll be in touch.");
      if (form.email) {
        posthog.identify(form.email, {
          name: form.full_name || undefined,
          batch: form.batch || undefined,
          degree: form.degree || undefined,
        });
      }
      posthog.capture('maintainer_access_requested', {
        batch: form.batch,
        degree: form.degree,
      });
      setDone(true);
    } catch (error) {
      console.error("Maintainer request error:", error);
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-14 text-slate-950 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(180,83,9,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(180,83,9,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_95%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0.35))]" />

      <section className="relative z-10 mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="mx-auto mb-4 w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
            Pass the torch
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Take over as maintainer
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            If you&apos;re from a currently studying batch and want to keep Placement Tales alive
            for everyone, request access below and I&apos;ll help you take over.
          </p>
        </div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          >
            <h2 className="text-2xl font-black text-amber-950">Request received</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Thanks for stepping up. I&apos;ll review your request and reach out
              over email or LinkedIn to hand things over.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
            >
              Back home
            </Link>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8"
          >
            <div className="grid gap-4">
              <TextField
                label="Full name"
                required
                showOptional={false}
                value={form.full_name}
                onChange={(v) => update("full_name", v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Batch (graduating year)"
                  placeholder="e.g. 2027"
                  required
                  showOptional={false}
                  value={form.batch}
                  onChange={(v) => update("batch", v)}
                />
                <TextField
                  label="Degree"
                  placeholder="e.g. B.Tech CSE"
                  required
                  showOptional={false}
                  value={form.degree}
                  onChange={(v) => update("degree", v)}
                />
              </div>
              <TextField
                label="Department"
                placeholder="e.g. Computer Science"
                required
                showOptional={false}
                value={form.department}
                onChange={(v) => update("department", v)}
              />
              <TextField
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                showOptional={false}
                value={form.email}
                onChange={(v) => update("email", v)}
              />
              <TextField
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/your-handle"
                required
                showOptional={false}
                value={form.linkedin_url}
                onChange={(v) => update("linkedin_url", v)}
              />
              <TextArea
                label="Why do you want access?"
                rows={3}
                required
                showOptional={false}
                placeholder="A line or two about why you'd be a good maintainer."
                value={form.reason}
                onChange={(v) => update("reason", v)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Request maintainer access"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
