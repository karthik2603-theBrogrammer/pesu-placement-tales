"use client";
// import "@blocknote/core/fonts/inter.css";
// import { useCreateBlockNote } from "@blocknote/react";
// import { BlockNoteView } from "@blocknote/mantine";
// import "@blocknote/mantine/style.css";
import dynamic from "next/dynamic";

import { useState, useEffect } from "react";
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
  const [selectedStudent, setSelectedStudent] = useState(null); // Store selected student
  const [isModalOpen, setIsModalOpen] = useState(false); // Handle modal visibility
  const [userVotes, setUserVotes] = useState({}); // studentId -> 'up' | 'down' (from localStorage)
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

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
    if (value.length > 0) {
      const filtered = companies.filter((company) =>
        company.company_name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
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
    setSearchQuery(company.company_name);
    const studentsPlacedById = await fetchStudentsPlacedById(company.id);
    if (studentsPlacedById) {
      setStudentsPlacedAtCompanySelected(studentsPlacedById);
    }
    setSuggestions([]);
  };

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

              {visibleCompanies.length === 0 ? (
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

          {/* Display spinner while students are being fetched */}
          {loadingStudents && (
            <div className="my-6 flex items-center justify-center rounded-2xl border border-amber-100 bg-white/70 p-5 shadow-sm">
              <Spinner color="warning" labelColor="warning" className="text-xs">
                Loading students...
              </Spinner>
            </div>
          )}

          {/* Display students once they are fetched */}
          {studentsPlacedAtCompanySelected.length > 0 && !loadingStudents && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {studentsPlacedAtCompanySelected.map((item, index) => (
                <button
                  key={item.student_id ?? index}
                  type="button"
                  onClick={() => handleSelectStudent(item)}
                  className="group rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {item.first_name} {item.middle_name} {item.last_name}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <span>Placed {item.year_placed}</span>
                    <span className="ml-auto flex items-center gap-2 font-medium">
                      <span>▲ {item.upvote ?? 0}</span>
                      <span className="text-slate-400">▼ {item.downvote ?? 0}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Modal for displaying student remarks */}
          {selectedStudent && (
            <div
              tabIndex="-1"
              className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto h-[calc(100%-1rem)] max-h-full ${
                isModalOpen
                  ? "backdrop-blur-md backdrop-filter block"
                  : "hidden"
              }`}
            >
              <div className="relative w-full max-w-7xl max-h-full">
                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  {/* Modal header */}
                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        {`${selectedStudent?.first_name} ${selectedStudent?.last_name}'s Experience`}
                      </h3>
                      {selectedStudent?.student_id && (
                        <Link
                          href={`/share?q=${
                            selectedStudent?.student_id
                          }&token=${generateRandomToken()}`}
                        >
                          <FaLink size={15} color="#d97706" />
                        </Link>
                      )}
                    </div>
                    <Button
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={closeModal}
                    >
                      <svg
                        className="w-3 h-3"
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
                      <span className="sr-only">Close modal</span>
                    </Button>
                  </div>

                  {/* Modal body */}
                  <div className="p-4 md:p-5 space-y-4 overflow-y-scroll max-h-[600px]">
                    {/* <BlockNoteView
                      editor={editor}
                      editable={false}
                      theme="light"
                    /> */}
                    <MarkdownReviewRenderer
                      remarks_markdown={selectedStudent?.remarks_markdown}
                    />
                  </div>

                  {/* Modal footer */}
                  <div className="flex flex-row items-center justify-end gap-3 p-4">
                    <div className="mr-auto flex items-center gap-2">
                      <span className="mr-1 text-xs font-medium text-gray-500">
                        Was this helpful?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVote("up")}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                          userVotes[selectedStudent?.student_id] === "up"
                            ? "border-amber-400 bg-amber-100 text-amber-800"
                            : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        <span>▲</span>
                        <span>{selectedStudent?.upvote ?? 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote("down")}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                          userVotes[selectedStudent?.student_id] === "down"
                            ? "border-slate-400 bg-slate-100 text-slate-700"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span>▼</span>
                        <span>{selectedStudent?.downvote ?? 0}</span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
