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
import { Toaster } from "sonner";
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
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
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
            <div className="mt-6">
              {studentsPlacedAtCompanySelected.map((item, index) => (
                <Button
                  key={index}
                  className="flex flex-col items-center justify-center py-7"
                  onClick={() => handleSelectStudent(item)}
                  variant="flat"
                  color="success"
                >
                  <p>
                    {item.first_name} {item.middle_name} {item.last_name}
                  </p>
                  {/* <p className="-m-2">{item.year_placed}</p>
                  <div className="flex flex-row gap-2">
                    <p className="">{item.upvote}</p>
                    <p className="">{item.downvote}</p>
                  </div> */}
                </Button>
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
                          <FaLink size={15} color = "green" />
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
                  <div className="flex flex-row items-center justify-end p-4">
                    <div className="flex flex-row gap-2 mx-4">
                      <Button className="" variant="flat" color="success">
                        {selectedStudent?.upvote}
                      </Button>
                      <Button className="" variant="flat" color="danger">
                        {selectedStudent?.downvote}
                      </Button>
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
