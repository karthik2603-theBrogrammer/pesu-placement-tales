"use client";
// import "@blocknote/core/fonts/inter.css";
// import { useCreateBlockNote } from "@blocknote/react";
// import { BlockNoteView } from "@blocknote/mantine";
// import "@blocknote/mantine/style.css";
import dynamic from "next/dynamic";

import { useState, useEffect } from "react";
import { Modal, Tooltip, Spinner, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import H from "../components/Heading";
import P from "../components/Paragraph";
import { Toaster } from "sonner";
import { CiSearch, CiCircleInfo } from "react-icons/ci";

const MarkdownReviewRenderer = dynamic(() => import("../components/MarkdownReviewRenderer"), {
  ssr: false,
});

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
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Toaster position="top-center" />
          <div className="text-center mb-8">
            <div className="flex flex-row items-center justify-center">
              <H text={"Browse Companies 👀"} />
              <Tooltip
                content={
                  "You can either search for a company below, or be picky with your choice over to your left (Coming Soon) (>..<)"
                }
                className="text-xs w-[400px]"
              >
                <div className="ml-3 mb-9">
                  <CiCircleInfo />
                </div>
              </Tooltip>
            </div>
            <P
              text={
                "Explore all companies that visited campus over the years! Select your target and give it your best shot!"
              }
            />
            <P
              styles={"-mt-3"}
              text={
                "Browse companies, view interview experience and gain advice from students placed there."
              }
            />
          </div>

          {/* Display companies in a flexbox once they are loaded */}
          {loadingCompanies ? (
            <div className="flex items-center justify-center">
              <Spinner color="warning" labelColor="warning" className="text-xs">
                Loading companies...
              </Spinner>
              <Tooltip
                content={
                  "We are currenty using a free suite of services. You may experience a delay due to heavy load on the server. Kindly wait or try later ;)"
                }
                className="text-xs w-[400px]"
              >
                <div className="ml-2">
                  <CiCircleInfo color="green" />
                </div>
              </Tooltip>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {companies.map((company) => (
                <Button
                  key={company.id}
                  className="flex items-center justify-center p-4 cursor-pointer text-center"
                  onClick={() => handleSelectCompany(company)}
                  variant="flat"
                >
                  <div className="flex flex-col m-2 items-center justify-center">
                    <p className="md:text-sm text-xs font-medium text-gray-800">
                      {company.company_name}
                    </p>
                    <p className=" text-xs md:flex w-full hidden text-center text-gray-500">
                      {company.company_description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Display spinner while students are being fetched */}
          {loadingStudents && (
            <div className="flex items-center justify-center my-4">
              <Spinner color="warning" labelColor="warning" className="text-xs">
                Loading students...
              </Spinner>
              <Tooltip
                content={
                  "Fetching student data. Kindly wait while we retrieve the details."
                }
                className="text-xs w-[400px]"
              >
                <div className="ml-2">
                  <CiCircleInfo color="green" />
                </div>
              </Tooltip>
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
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {`${selectedStudent?.first_name} ${selectedStudent?.last_name}'s Experience`}
                    </h3>
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
                    <MarkdownReviewRenderer remarks_markdown = {selectedStudent?.remarks_markdown}/>
                  </div>

                  {/* Modal footer */}
                  <div className="flex flex-row items-center justify-end p-4">
                  <div className="flex flex-row gap-2 mx-4">
                    <Button className="" variant="flat" color="success">{selectedStudent?.upvote}</Button>
                    <Button className="" variant="flat" color="danger" >{selectedStudent?.downvote}</Button>
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
