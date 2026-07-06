"use client";
import { formatPlacementTypes } from "../../utils/placementType";
import { formatVerdict } from "../../utils/verdict";
import { displayStoryName } from "../../utils/displayName";
// import "@blocknote/core/fonts/inter.css";
// import { useCreateBlockNote } from "@blocknote/react";
// import { BlockNoteView } from "@blocknote/mantine";
// import "@blocknote/mantine/style.css";
import dynamic from "next/dynamic";

import { useState, useEffect, useRef } from "react";
import { Spinner, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import H from "../components/Heading";
import P from "../components/Paragraph";
import { Toaster, toast } from "sonner";
import { CiSearch } from "react-icons/ci";
import { FaLink } from "react-icons/fa";
import Link from "next/link";

import { generateRandomToken } from "../../utils/index";

const MarkdownReviewRenderer = dynamic(
  () => import("../components/MarkdownReviewRenderer"),
  {
    ssr: false,
  }
);

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true); // Loading state for companies
  const [searchQuery, setSearchQuery] = useState("");
  const [studentsPlacedAtCompanySelected, setStudentsPlacedAtCompanySelected] =
    useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false); // Loading state for students
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const storiesRef = useRef(null);
  const resultsStatusRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null); // Store selected student
  const [isModalOpen, setIsModalOpen] = useState(false); // Handle modal visibility
  const [userVotes, setUserVotes] = useState({}); // studentId -> 'up' | 'down' (from localStorage)
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isModalOpen]);

  // Load the viewer's previous votes so they can't vote the same post repeatedly.
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("pt_votes") || "{}");
      setUserVotes(stored);
    } catch {
      setUserVotes({});
    }
  }, []);

  const handleVote = async (target) => {
    const id = selectedStudent?.student_id;
    if (!id) return;

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
    } else {
      if (prev === "down") {
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
    }

    try {
      const response = await fetch("/api/vote-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id, upDelta, downDelta }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vote failed.");

      setSelectedStudent((cur) =>
        cur ? { ...cur, upvote: data.upvote, downvote: data.downvote } : cur
      );
      setStudentsPlacedAtCompanySelected((list) =>
        list.map((it) =>
          it.student_id === id
            ? { ...it, upvote: data.upvote, downvote: data.downvote }
            : it
        )
      );

      const nextVotes = { ...userVotes };
      if (next) nextVotes[id] = next;
      else delete nextVotes[id];
      setUserVotes(nextVotes);
      localStorage.setItem("pt_votes", JSON.stringify(nextVotes));
    } catch (error) {
      console.error("Error voting:", error);
      toast.error(error.message || "Could not register your vote.");
    }
  };

  const visibleCompanies = searchQuery.trim() ? suggestions : companies;
  const companyGridClass =
    visibleCompanies.length <= 6
      ? "grid max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[430px] overflow-y-auto pr-1";

  // Create BlockNote editor instance
  // const editor = useCreateBlockNote();

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoadingCompanies(true);
        const response = await fetch("/api/get-companies");
        const data = await response.json();
        setCompanies(data.result);
        setLoadingCompanies(false);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setLoadingCompanies(false);
      }
    }
    fetchCompanies();
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (selectedCompany && value !== selectedCompany.company_name) {
      setSelectedCompany(null);
      setStudentsPlacedAtCompanySelected([]);
    }
    if (value.length > 0) {
      const filtered = companies.filter((company) =>
        company.company_name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
      setSelectedCompany(null);
      setStudentsPlacedAtCompanySelected([]);
    }
  };

  async function fetchStudentsPlacedById(id) {
    var students = null;
    try {
      setLoadingStudents(true); // Start loading spinner
      const response = await fetch(`/api/getStudentsByCompany/${id}`);
      const data = await response.json();
      students = data;
      setLoadingStudents(false); // Stop loading spinner
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoadingStudents(false); // Stop loading spinner
    }
    return students;
  }

  const handleSelectCompany = async (company) => {
    setSelectedCompany(company);
    setSearchQuery(company.company_name);
    setSuggestions([company]);
    setStudentsPlacedAtCompanySelected([]);
    const studentsPlacedById = await fetchStudentsPlacedById(company.id);
    if (studentsPlacedById) {
      setStudentsPlacedAtCompanySelected(studentsPlacedById);
    }
  };

  useEffect(() => {
    if (!selectedCompany || loadingStudents) return;
    const target =
      studentsPlacedAtCompanySelected.length > 0
        ? storiesRef.current
        : resultsStatusRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedCompany, loadingStudents, studentsPlacedAtCompanySelected.length]);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student); // Set selected student data
    // Convert the student's markdown to blocks
    // const blocks = await editor.tryParseMarkdownToBlocks(
    //   student.remarks_markdown
    // );
    // editor.replaceBlocks(editor.document, blocks); // Replace blocks in the editor
    setIsModalOpen(true);
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-white">
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(180,83,9,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(180,83,9,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_95%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0.35))]" />

      <div className="relative z-10 flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Toaster position="top-center" />
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <div className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Company directory
            </div>
            <H text={"Browse Companies"} styles="text-gray-900" />
            <P
              styles={"mx-auto max-w-xl"}
              text={"Choose a company to read placement stories from seniors."}
            />
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-center sm:px-5">
              <p className="text-sm leading-relaxed text-slate-600">
                After reading a story, rate how helpful it was.{" "}
                <span className="inline-flex items-center gap-1 align-middle">
                  <span
                    aria-hidden
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm"
                  >
                    ▲ <span className="tabular-nums">12</span>
                  </span>
                </span>{" "}
                when an experience felt credible — it helps juniors find the
                good ones.{" "}
                <span className="inline-flex items-center gap-1 align-middle">
                  <span
                    aria-hidden
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm"
                  >
                    ▼ <span className="tabular-nums">2</span>
                  </span>
                </span>{" "}
                if it wasn't useful, so others know to look at a different experience.
              </p>
            </div>
          </div>

          {/* Display companies in a flexbox once they are loaded */}
          {loadingCompanies ? (
            <div className="flex items-center justify-center rounded-3xl border border-amber-100 bg-white/70 p-10 shadow-sm">
              <Spinner color="warning" labelColor="warning" className="text-xs">
                Loading companies...
              </Spinner>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-amber-100 bg-white/75 p-4 shadow-sm backdrop-blur md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Companies
                  </h2>
                  <p className="text-xs text-gray-500">
                    {visibleCompanies.length} shown of {companies.length}
                  </p>
                </div>
                <Input
                  aria-label="Search companies"
                  className="w-full md:max-w-sm"
                  placeholder="Search company..."
                  startContent={<CiSearch className="text-gray-400" />}
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                  color="warning"
                  variant="bordered"
                />
              </div>

              {selectedCompany ? (
                <div
                  ref={resultsStatusRef}
                  className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50/70 px-6 py-8 text-center"
                >
                  {loadingStudents ? (
                    <div className="flex flex-col items-center gap-3">
                      <Spinner color="warning" size="sm" />
                      <p className="text-sm text-amber-800">
                        Finding results for{" "}
                        <span className="font-semibold text-amber-950">
                          {selectedCompany.company_name}
                        </span>
                      </p>
                    </div>
                  ) : studentsPlacedAtCompanySelected.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No stories yet for{" "}
                      <span className="font-semibold text-amber-950">
                        {selectedCompany.company_name}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-amber-800">
                      Found {studentsPlacedAtCompanySelected.length} for{" "}
                      <span className="font-semibold text-amber-950">
                        {selectedCompany.company_name}
                      </span>
                    </p>
                  )}
                </div>
              ) : visibleCompanies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-8 text-center text-sm text-gray-500">
                  No companies found.
                </div>
              ) : (
                <div className={companyGridClass}>
                  {visibleCompanies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleSelectCompany(company)}
                      className="group min-h-[88px] rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
                    >
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                        {company.company_name}
                      </p>
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-amber-600 opacity-75 transition group-hover:opacity-100">
                        View stories
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCompany &&
            !loadingStudents &&
            studentsPlacedAtCompanySelected.length > 0 && (
            <div
              ref={storiesRef}
              className="mt-4 grid grid-cols-1 gap-3 scroll-mt-24 sm:grid-cols-2 lg:grid-cols-3"
            >
              {studentsPlacedAtCompanySelected.map((item, index) => (
                <button
                  key={item.student_id ?? index}
                  type="button"
                  onClick={() => handleSelectStudent(item)}
                  className="group rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {displayStoryName(item)}
                      </p>
                      {item.job_title && (
                        <p className="truncate text-xs text-amber-700">{item.job_title}</p>
                      )}
                    </div>
                    <span className="shrink-0 tabular-nums text-[10px] leading-tight text-slate-400">
                      <span className="text-amber-600">▲{item.upvote ?? 0}</span>
                      {" · "}
                      <span>▼{item.downvote ?? 0}</span>
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] leading-tight text-slate-500">
                    <span className="font-medium text-amber-800">
                      {formatPlacementTypes(item)}
                    </span>
                    <span className="text-amber-300"> · </span>
                    {item.year_placed}
                    <span className="text-amber-300"> · </span>
                    <span
                      className={
                        item.verdict === "rejected"
                          ? "font-medium text-red-600"
                          : "font-medium text-emerald-600"
                      }
                    >
                      {formatVerdict(item.verdict)}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Story reader — full-screen on mobile, sits above navbar */}
          {isModalOpen && selectedStudent && (
            <div
              className="fixed inset-0 z-[100] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="story-modal-title"
            >
              <button
                type="button"
                className="absolute inset-0 bg-slate-900/55"
                onClick={closeModal}
                aria-label="Close story"
              />
              <div className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-3xl flex-col bg-white shadow-2xl sm:my-3 sm:h-[calc(100dvh-1.5rem)] sm:max-h-[900px] sm:rounded-2xl sm:border sm:border-amber-100">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-amber-100 px-4 py-3 sm:px-5 sm:py-4">
                  <div className="min-w-0 flex-1">
                    <h3
                      id="story-modal-title"
                      className="text-base font-semibold leading-snug text-gray-900 sm:text-lg"
                    >
                      {selectedStudent.job_title
                        ? `${displayStoryName(selectedStudent)} · ${selectedStudent.job_title}`
                        : `${displayStoryName(selectedStudent)}'s experience`}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {selectedStudent.student_id && (
                      <Link
                        href={`/share?q=${selectedStudent.student_id}&token=${generateRandomToken()}`}
                        className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"
                      >
                        <FaLink size={15} />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      aria-label="Close"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
                  <MarkdownReviewRenderer
                    remarks_markdown={selectedStudent.remarks_markdown}
                  />
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-amber-100 px-4 py-3 sm:px-5">
                  <div className="mr-auto flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      Was this helpful?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVote("up")}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                        userVotes[selectedStudent.student_id] === "up"
                          ? "border-amber-400 bg-amber-100 text-amber-800"
                          : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                      }`}
                    >
                      <span>▲</span>
                      <span>{selectedStudent.upvote ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVote("down")}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                        userVotes[selectedStudent.student_id] === "down"
                          ? "border-slate-400 bg-slate-100 text-slate-700"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>▼</span>
                      <span>{selectedStudent.downvote ?? 0}</span>
                    </button>
                  </div>
                  <Button
                    color="warning"
                    type="button"
                    onClick={closeModal}
                    className="text-white"
                    variant="shadow"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
