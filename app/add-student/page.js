"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import Mascot from "../components/contribute/Mascot";
import Stepper from "../components/contribute/Stepper";
import ProgressRing from "../components/contribute/ProgressRing";
import {
  ChoiceCards,
  CompanyPicker,
  FieldLabel,
  RoundsEditor,
  TextArea,
  TextField,
} from "../components/contribute/fields";
import { buildExperienceMarkdown, validateInterviewStep } from "../../utils/experienceMarkdown";
import { PLACEMENT_TYPE_OPTIONS } from "../../utils/placementType";
import { DEGREE_OPTIONS, DEFAULT_DEGREE } from "../../utils/degree";
import { VERDICT_OPTIONS } from "../../utils/verdict";
import VerdictChip from "../components/VerdictChip";

const MarkdownReviewRenderer = dynamic(
  () => import("../components/MarkdownReviewRenderer"),
  { ssr: false }
);

const INITIAL_DATA = {
  company: { mode: null, company_id: null, company_name: "", new_company_description: "" },
  person: {
    first_name: "",
    middle_name: "",
    last_name: "",
    job_title: "",
    year_placed: "",
    batch_of: "",
    linkedin_url: "",
    phone_number: "",
    anonymous: false,
    verdict: "",
    degree: DEFAULT_DEGREE,
    internship_fte: false,
    internship_only: false,
    fte_only: false,
    summer_internship: false,
  },
  about: { technical_interests: "", cgpa: "", clubs: "", hobbies: "" },
  opinions: { dsa_view: "", skills_vs_dsa: "", good_cgpa: "" },
  source: "",
  rounds: [{ description: "", questions: "", duration: "", outcome: "" }],
  compensation: {
    internship_stipend: "",
    base_salary: "",
    total_ctc: "",
    stocks: "",
    bonuses: "",
    other_benefits: "",
  },
  dates: { arrival: "", online_test: "", interview: "", placement: "" },
  resources: { books: "", websites: "", courses: "", platforms: "", others: "" },
  tips: "",
};

const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
const PHONE_REGEX = /^[+]?[0-9]{10,15}$/;

/** Shown when the contributor opts to stay anonymous. */
const ANONYMOUS_IDENTITY = {
  first_name: "John",
  middle_name: "",
  last_name: "Doe",
  linkedin_url: "",
  phone_number: "",
};

// Beacon strikes a different pose each step — position, tilt, drift and facing.
const MASCOT_POSES = [
  { justify: "flex-start", rotate: -6, y: 0, flip: false },
  { justify: "flex-end", rotate: 6, y: 8, flip: true },
  { justify: "center", rotate: -3, y: -6, flip: false },
  { justify: "flex-start", rotate: 9, y: 4, flip: false },
  { justify: "flex-end", rotate: -6, y: -3, flip: true },
  { justify: "center", rotate: 4, y: 6, flip: false },
  { justify: "flex-start", rotate: -8, y: 0, flip: false },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

function encouragement(pct) {
  if (pct <= 0) return "Let's do this — it's quick!";
  if (pct < 34) return "Great start, keep going!";
  if (pct < 67) return "You're halfway there!";
  if (pct < 100) return "Almost there, nearly done!";
  return "All set — ready to submit!";
}

function trackContributeStep(event, { key, label, index, total, extra = {} }) {
  posthog.capture(event, {
    step_key: key,
    step_label: label,
    step_index: index,
    step_number: index + 1,
    total_steps: total,
    ...extra,
  });
}

export default function ContributePage() {
  const [companies, setCompanies] = useState([]);
  const [data, setData] = useState(INITIAL_DATA);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/get-companies");
        const payload = await response.json();
        setCompanies(payload.result || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Could not load companies. You can still add a new one.");
      }
    }
    fetchCompanies();
  }, []);

  const setSection = useCallback((key, patch) => {
    setData((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  const setValue = useCallback((key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const togglePlacementType = useCallback((key) => {
    setData((prev) => {
      const flags = PLACEMENT_TYPE_OPTIONS.reduce(
        (acc, opt) => ({ ...acc, [opt.key]: opt.key === key }),
        {}
      );
      return { ...prev, person: { ...prev.person, ...flags } };
    });
  }, []);

  const toggleAnonymous = useCallback((yes) => {
    setData((prev) => {
      const { job_title, year_placed, batch_of, verdict, degree, internship_fte, internship_only, fte_only, summer_internship } =
        prev.person;
      const placementFlags = { internship_fte, internship_only, fte_only, summer_internship };
      if (yes) {
        return {
          ...prev,
          person: {
            anonymous: true,
            ...ANONYMOUS_IDENTITY,
            job_title,
            year_placed,
            batch_of,
            verdict,
            degree,
            ...placementFlags,
          },
        };
      }
      return {
        ...prev,
        person: {
          anonymous: false,
          first_name: "",
          middle_name: "",
          last_name: "",
          job_title,
          year_placed,
          batch_of,
          verdict,
          degree,
          linkedin_url: "",
          phone_number: "",
          ...placementFlags,
        },
      };
    });
  }, []);

  const experienceMarkdown = useMemo(
    () => buildExperienceMarkdown(data, data.company.company_name),
    [data]
  );

  const steps = useMemo(() => {
    const p = data.person;
    return [
      {
        key: "company",
        label: "Company",
        title: "Let's start with the company",
        subtitle: "Pick an existing one, or type a new company to add it.",
        mascot: "Hi! I'm Beacon. This is quick — just pick or add your company to begin.",
        validate: () =>
          data.company.mode && data.company.company_name.trim()
            ? null
            : "Please select or add a company.",
        render: () => (
          <CompanyPicker
            companies={companies}
            value={data.company}
            onChange={(value) => setValue("company", value)}
          />
        ),
      },
      {
        key: "identity",
        label: "About you",
        title: "A bit about you",
        subtitle:
          "Required fields are marked with *. Everything else is optional.",
        mascot: p.anonymous
          ? "No worries — John Doe has your back. Just the role and interview year!"
          : "Nice to meet you! Share what you're comfortable with.",
        validate: () => {
          if (!p.job_title.trim()) return "Job title is required.";
          const year = parseInt(p.year_placed, 10);
          if (!year || Number.isNaN(year)) return "Enter a valid interview year.";
          const batch = parseInt(p.batch_of, 10);
          if (!batch || Number.isNaN(batch)) return "Enter a valid batch year.";
          if (!p.verdict) return "Select a verdict — Selected or Rejected.";
          if (!PLACEMENT_TYPE_OPTIONS.some((opt) => p[opt.key])) {
            return "Select a placement type.";
          }
          if (!p.anonymous) {
            if (!p.first_name.trim()) return "First name is required.";
            if (!p.last_name.trim()) return "Last name is required.";
            if (p.linkedin_url.trim() && !LINKEDIN_REGEX.test(p.linkedin_url.trim()))
              return "Enter a valid LinkedIn URL.";
            if (p.phone_number.trim() && !PHONE_REGEX.test(p.phone_number.trim()))
              return "Enter a valid phone number.";
          }
          return null;
        },
        render: () => (
          <div className="grid gap-4">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-700 transition hover:border-amber-300 hover:bg-amber-100">
              <input
                type="checkbox"
                checked={p.anonymous}
                onChange={(e) => toggleAnonymous(e.target.checked)}
                className="h-3.5 w-3.5 shrink-0 accent-amber-500"
              />
              <span>
                Stay anonymous{" "}
                <span className="text-slate-400">(shows as John Doe)</span>
              </span>
            </label>

            <div className="space-y-2 rounded-xl border border-amber-100 bg-white/80 px-4 py-3">
              <p className="text-xs text-slate-600">
                <span className="text-red-500">*</span>{" "}
                <span className="font-semibold text-slate-900">Required</span>
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                Share contact details if you&apos;re comfortable — juniors appreciate
                being able to reach out.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TextField
                label="First name"
                required={!p.anonymous}
                showOptional={false}
                autoFocus={!p.anonymous}
                disabled={p.anonymous}
                value={p.first_name}
                onChange={(v) => setSection("person", { first_name: v })}
              />
              <TextField
                label="Middle name"
                showOptional={false}
                disabled={p.anonymous}
                value={p.middle_name}
                onChange={(v) => setSection("person", { middle_name: v })}
              />
              <TextField
                label="Last name"
                required={!p.anonymous}
                showOptional={false}
                disabled={p.anonymous}
                value={p.last_name}
                onChange={(v) => setSection("person", { last_name: v })}
              />
            </div>
            <TextField
              label="Job title"
              required
              placeholder="e.g. Software Engineer, SDE, Business Analyst"
              value={p.job_title}
              onChange={(v) => setSection("person", { job_title: v })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Year of interview"
                required
                type="number"
                placeholder="e.g. 2025"
                value={p.year_placed}
                onChange={(v) => setSection("person", { year_placed: v })}
              />
              <TextField
                label="Batch"
                required
                type="number"
                placeholder="e.g. 2026"
                value={p.batch_of}
                onChange={(v) => setSection("person", { batch_of: v })}
              />
            </div>
            <div>
                <FieldLabel required>Verdict</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {VERDICT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        p.verdict === opt.value
                          ? opt.value === "selected"
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : "border-red-400 bg-red-50 text-red-800"
                          : "border-amber-200 bg-white/70 text-amber-700 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="verdict"
                        checked={p.verdict === opt.value}
                        onChange={() => setSection("person", { verdict: opt.value })}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel required>Placement type</FieldLabel>
                <div className="grid gap-2">
                  {PLACEMENT_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                        p[opt.key]
                          ? "border-amber-400 bg-amber-100 text-amber-900"
                          : "border-amber-200 bg-white/70 text-amber-700 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!p[opt.key]}
                        onChange={() => togglePlacementType(opt.key)}
                        className="h-4 w-4 shrink-0 accent-amber-500"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel required className="mb-2">
                  Degree
                </FieldLabel>
                <select
                  value={p.degree}
                  onChange={(e) => setSection("person", { degree: e.target.value })}
                  className="w-full rounded-xl border border-amber-100 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {DEGREE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TextField
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/your-handle"
              disabled={p.anonymous}
              value={p.linkedin_url}
              onChange={(v) => setSection("person", { linkedin_url: v })}
            />
            <TextField
              label="Phone number"
              placeholder="10-15 digits"
              disabled={p.anonymous}
              value={p.phone_number}
              onChange={(v) => setSection("person", { phone_number: v })}
            />
          </div>
        ),
      },
      {
        key: "story",
        label: "Your story",
        title: "Your story so far",
        subtitle: p.anonymous
          ? "CGPA is required when anonymous — everything else here is optional."
          : "A quick intro and your honest takes. Skip anything you like.",
        mascot: "Honest opinions here are gold for juniors — but feel free to skip.",
        optional: !p.anonymous,
        validate: () =>
          p.anonymous && !data.about.cgpa.trim()
            ? "CGPA is required when staying anonymous."
            : null,
        render: () => (
          <div className="grid gap-5">
            <div className="grid gap-3">
              <SubHeading optional>About you</SubHeading>
              <TextArea
                label="Technical interests"
                rows={2}
                showOptional={false}
                placeholder="e.g. Full-stack, DevOps, gamedev…"
                value={data.about.technical_interests}
                onChange={(v) => setSection("about", { technical_interests: v })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="CGPA"
                  required={p.anonymous}
                  showOptional={!p.anonymous}
                  placeholder="e.g. 8.14"
                  value={data.about.cgpa}
                  onChange={(v) => setSection("about", { cgpa: v })}
                />
                <TextField
                  label="Clubs"
                  showOptional={false}
                  placeholder="e.g. GDSC, CodeChef…"
                  value={data.about.clubs}
                  onChange={(v) => setSection("about", { clubs: v })}
                />
              </div>
              <TextField
                label="Hobbies"
                showOptional={false}
                placeholder="e.g. football, reading…"
                value={data.about.hobbies}
                onChange={(v) => setSection("about", { hobbies: v })}
              />
            </div>
            <div className="grid gap-3">
              <SubHeading optional>Quick opinions</SubHeading>
              <TextArea
                label="DSA & CP — how necessary for placements?"
                rows={2}
                showOptional={false}
                value={data.opinions.dsa_view}
                onChange={(v) => setSection("opinions", { dsa_view: v })}
              />
              <TextArea
                label="Skills/projects vs DSA?"
                rows={2}
                showOptional={false}
                value={data.opinions.skills_vs_dsa}
                onChange={(v) => setSection("opinions", { skills_vs_dsa: v })}
              />
              <TextField
                label="What is a good CGPA?"
                showOptional={false}
                value={data.opinions.good_cgpa}
                onChange={(v) => setSection("opinions", { good_cgpa: v })}
              />
            </div>
          </div>
        ),
      },
      {
        key: "interview",
        label: "Interview",
        title: "The interview journey",
        subtitle:
          "Select placement source and complete Round 1 in full — extra rounds are optional.",
        mascot: "Break it down round by round — the specifics help juniors most.",
        validate: () => validateInterviewStep({ source: data.source, rounds: data.rounds }),
        render: () => (
          <div className="grid gap-5">
            <div className="grid gap-3">
              <FieldLabel required>How did this opportunity come to you?</FieldLabel>
              <ChoiceCards
                options={["On campus", "Off campus"]}
                value={data.source}
                onChange={(v) => setValue("source", v)}
              />
            </div>
            <div className="grid gap-3">
              <FieldLabel required>Interview rounds</FieldLabel>
              <p className="text-xs leading-relaxed text-slate-500">
                Please be as detailed as you can — just the way you would like to read it.
              </p>
              <RoundsEditor
                rounds={data.rounds}
                onChange={(v) => setValue("rounds", v)}
              />
            </div>
          </div>
        ),
      },
      {
        key: "offer",
        label: "The offer",
        title: "The offer",
        subtitle: "Compensation and timeline. Share what you're comfortable with. Leave them blank if you dont remember.",
        mascot: "Numbers and dates are optional, but they set clear expectations.",
        optional: true,
        render: () => (
          <div className="grid gap-5">
            <div className="grid gap-3">
              <SubHeading optional>Compensation</SubHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Internship stipend"
                  showOptional={false}
                  value={data.compensation.internship_stipend}
                  onChange={(v) => setSection("compensation", { internship_stipend: v })}
                />
                <TextField
                  label="Base salary"
                  showOptional={false}
                  value={data.compensation.base_salary}
                  onChange={(v) => setSection("compensation", { base_salary: v })}
                />
                <TextField
                  label="Total CTC"
                  showOptional={false}
                  value={data.compensation.total_ctc}
                  onChange={(v) => setSection("compensation", { total_ctc: v })}
                />
                <TextField
                  label="Stocks"
                  showOptional={false}
                  value={data.compensation.stocks}
                  onChange={(v) => setSection("compensation", { stocks: v })}
                />
                <TextField
                  label="Bonuses"
                  showOptional={false}
                  value={data.compensation.bonuses}
                  onChange={(v) => setSection("compensation", { bonuses: v })}
                />
                <TextField
                  label="Other benefits"
                  showOptional={false}
                  value={data.compensation.other_benefits}
                  onChange={(v) => setSection("compensation", { other_benefits: v })}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <SubHeading optional>Key dates</SubHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Company arrival"
                  showOptional={false}
                  value={data.dates.arrival}
                  onChange={(v) => setSection("dates", { arrival: v })}
                />
                <TextField
                  label="Online test"
                  showOptional={false}
                  value={data.dates.online_test}
                  onChange={(v) => setSection("dates", { online_test: v })}
                />
                <TextField
                  label="Interview"
                  showOptional={false}
                  value={data.dates.interview}
                  onChange={(v) => setSection("dates", { interview: v })}
                />
                <TextField
                  label="Placement"
                  showOptional={false}
                  value={data.dates.placement}
                  onChange={(v) => setSection("dates", { placement: v })}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "wisdom",
        label: "Wisdom",
        title: "Pass on your wisdom",
        subtitle: "Resources that helped, and parting advice.",
        mascot: "Last stretch! Drop the links and one tip you wish you'd known.",
        optional: true,
        render: () => (
          <div className="grid gap-5">
            <div className="grid gap-3">
              <SubHeading optional>Helpful resources</SubHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Books"
                  showOptional={false}
                  value={data.resources.books}
                  onChange={(v) => setSection("resources", { books: v })}
                />
                <TextField
                  label="Websites"
                  showOptional={false}
                  value={data.resources.websites}
                  onChange={(v) => setSection("resources", { websites: v })}
                />
                <TextField
                  label="Courses"
                  showOptional={false}
                  value={data.resources.courses}
                  onChange={(v) => setSection("resources", { courses: v })}
                />
                <TextField
                  label="Practice platforms"
                  showOptional={false}
                  value={data.resources.platforms}
                  onChange={(v) => setSection("resources", { platforms: v })}
                />
              </div>
              <TextField
                label="Others"
                showOptional={false}
                value={data.resources.others}
                onChange={(v) => setSection("resources", { others: v })}
              />
            </div>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <SubHeading optional>Tips for the next batch</SubHeading>
                <p className="text-xs leading-relaxed text-slate-500">
                  This is what helps students — so please be open. Talk about what
                  you wished you had known beforehand.
                </p>
              </div>
              <TextArea
                label="Free advice"
                rows={4}
                showOptional={false}
                placeholder="Write anything that could help the next batch…"
                value={data.tips}
                onChange={(v) => setValue("tips", v)}
              />
            </div>
          </div>
        ),
      },
      {
        key: "review",
        kind: "review",
        label: "Review",
        title: "Review & submit",
        subtitle: "Here's how your experience will look.",
        mascot: "You made it! Give it a final read, then send it off. 🎉",
      },
    ];
  }, [companies, data, setSection, setValue, toggleAnonymous]);

  const totalSteps = steps.length;
  const current = steps[stepIndex];
  const progress = Math.round((stepIndex / (totalSteps - 1)) * 100);
  const mascotPose = MASCOT_POSES[stepIndex % MASCOT_POSES.length];

  useEffect(() => {
    if (result) return;
    posthog.capture("contribute_form_started", { total_steps: totalSteps });
  }, [result, totalSteps]);

  useEffect(() => {
    if (result) return;
    const step = steps[stepIndex];
    if (!step) return;
    trackContributeStep("contribute_step_viewed", {
      key: step.key,
      label: step.label,
      index: stepIndex,
      total: totalSteps,
      extra: { optional: !!step.optional },
    });
  }, [result, stepIndex, steps, totalSteps]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStepIndex((i) => Math.min(totalSteps - 1, i + 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (current.validate) {
      const error = current.validate();
      if (error) {
        trackContributeStep("contribute_step_validation_failed", {
          key: current.key,
          label: current.label,
          index: stepIndex,
          total: totalSteps,
        });
        toast.error(error);
        return;
      }
    }
    trackContributeStep("contribute_step_completed", {
      key: current.key,
      label: current.label,
      index: stepIndex,
      total: totalSteps,
      extra: { skipped: false },
    });
    goNext();
  }, [current, goNext, stepIndex, totalSteps]);

  const handleSkip = useCallback(() => {
    trackContributeStep("contribute_step_completed", {
      key: current.key,
      label: current.label,
      index: stepIndex,
      total: totalSteps,
      extra: { skipped: true },
    });
    goNext();
  }, [current, goNext, stepIndex, totalSteps]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const p = data.person;
      const identity = p.anonymous
        ? { ...ANONYMOUS_IDENTITY }
        : {
            first_name: p.first_name.trim(),
            middle_name: p.middle_name.trim(),
            last_name: p.last_name.trim(),
            linkedin_url: p.linkedin_url.trim(),
            phone_number: p.phone_number.trim(),
          };

      const payload = {
        first_name: identity.first_name,
        middle_name: identity.middle_name,
        last_name: identity.last_name,
        job_title: p.job_title,
        year_placed: p.year_placed,
        batch_of: p.batch_of,
        verdict: p.verdict,
        degree: p.degree,
        linkedin_url: identity.linkedin_url,
        phone_number: identity.phone_number,
        internship_fte: !!p.internship_fte,
        internship_only: !!p.internship_only,
        fte_only: !!p.fte_only,
        summer_internship: !!p.summer_internship,
        is_anonymous: !!p.anonymous,
        remarks_markdown: experienceMarkdown,
        company_id:
          data.company.mode === "existing" ? data.company.company_id : undefined,
        new_company_name:
          data.company.mode === "new" ? data.company.company_name : undefined,
        new_company_description:
          data.company.mode === "new" ? data.company.new_company_description : undefined,
      };

      const response = await fetch("/api/submit-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-posthog-distinct-id": posthog.get_distinct_id() ?? "",
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Submission failed.");
      }

      toast.success("Thank you! Your experience has been shared.");
      trackContributeStep("contribute_step_completed", {
        key: current.key,
        label: current.label,
        index: stepIndex,
        total: totalSteps,
        extra: { skipped: false },
      });
      posthog.capture('story_submitted', {
        company_name: data.company.company_name,
        company_mode: data.company.mode,
        verdict: data.person.verdict,
        placement_type: data.person.internship_fte
          ? 'internship_fte'
          : data.person.internship_only
          ? 'internship_only'
          : data.person.fte_only
          ? 'fte_only'
          : data.person.summer_internship
          ? 'summer_internship'
          : 'unknown',
        year_placed: data.person.year_placed,
        batch_of: data.person.batch_of,
        is_anonymous: !!data.person.anonymous,
      });
      setResult(body);
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [current, data, experienceMarkdown, stepIndex, totalSteps]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(180,83,9,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(180,83,9,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_95%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0.35))]" />

      <section className="relative z-10 mx-auto max-w-5xl">
        {result ? (
          <SuccessCard result={result} />
        ) : (
          <div className="grid gap-8 md:grid-cols-[220px_1fr]">
            {/* left rail: circular progress + vertical stepper */}
            <aside className="hidden md:block">
              <div className="sticky top-10">
                <div className="mb-8 flex items-center gap-3">
                  <ProgressRing value={progress} />
                  <motion.p
                    key={encouragement(progress)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-bold leading-snug text-amber-700"
                  >
                    {encouragement(progress)}
                  </motion.p>
                </div>
                <Stepper steps={steps} current={stepIndex} />
              </div>
            </aside>

            {/* right column: mascot + form card */}
            <div>
              {/* compact progress for mobile */}
              <div className="mb-5 flex items-center gap-3 md:hidden">
                <ProgressRing value={progress} size={52} stroke={5} />
                <motion.p
                  key={encouragement(progress)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-bold text-amber-700"
                >
                  {encouragement(progress)}
                </motion.p>
              </div>

              {/* mascot changes pose (position, tilt, facing) each step */}
              <div className="mb-4 flex" style={{ justifyContent: mascotPose.justify }}>
                <motion.div
                  layout
                  animate={{ rotate: mascotPose.rotate, y: mascotPose.y }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  <Mascot message={current.mascot} flip={mascotPose.flip} />
                </motion.div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.key}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                >
                  {current.kind === "review" ? (
                    <div>
                      <StepHeader title={current.title} subtitle={current.subtitle} />
                      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
                        <p className="font-semibold">
                          {data.person.first_name} {data.person.last_name}
                        </p>
                        <p className="text-amber-700">
                          {data.company.company_name} · Batch {data.person.batch_of}
                        </p>
                        <div className="mt-2">
                          <VerdictChip verdict={data.person.verdict} />
                        </div>
                      </div>
                      <div className="max-h-[45vh] overflow-auto rounded-2xl border border-amber-100 bg-white/80 p-4">
                        <MarkdownReviewRenderer remarks_markdown={experienceMarkdown} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <StepHeader title={current.title} subtitle={current.subtitle} />
                      {current.render()}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* controls */}
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {current.optional && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-sm font-medium text-amber-600 hover:text-amber-800"
                    >
                      Skip
                    </button>
                  )}
                  {current.kind === "review" ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600 disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Submit experience"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function SubHeading({ children, optional = false }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
      {children}
      {optional ? (
        <span className="font-normal normal-case tracking-normal text-slate-400">
          {" "}
          (optional)
        </span>
      ) : null}
    </p>
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black tracking-tight text-amber-950 sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

function SuccessCard({ result }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mb-6 flex justify-center">
        <Mascot message="You did it! Your story is now live for juniors to learn from." />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-amber-950">
        Thank you for contributing!
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Your experience for{" "}
        <span className="font-semibold text-amber-700">{result.companyName}</span>{" "}
        has been saved and is now visible on the browse page.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/browse"
          className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
        >
          Browse experiences
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-amber-300 px-6 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
        >
          Share another
        </button>
      </div>
    </div>
  );
}
