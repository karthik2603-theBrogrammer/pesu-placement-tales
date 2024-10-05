"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import H from "../components/Heading";
import P from "../components/Paragraph";
import { Toaster, toast } from "sonner";
import FilterSidebar from "./FilterSidebar";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { FaBuilding, FaBriefcase, FaMoneyBillWave } from "react-icons/fa";
// Dynamically import CkeditorForm to avoid server-side rendering issues
const CustomEditor = dynamic(() => import("../components/CkeditorForm"), {
  ssr: false,
});

const CompanyCard = ({ company, onClick }) => (
  <div 
    className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-200 border border-gray-200"
    onClick={() => onClick(company)}
  >
    <div className="flex items-center mb-4">
      <FaBuilding className="text-blue-500 mr-3 text-xl" />
      <h3 className="text-xl font-semibold text-gray-800">{company.company_name}</h3>
    </div>
    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.company_description}</p>
    <div className="flex justify-between text-sm text-gray-500">
      <span className="flex items-center"><FaBriefcase className="mr-1" /> {company.job_type}</span>
      <span className="flex items-center"><FaMoneyBillWave className="mr-1" /> {company.ctc} LPA</span>
    </div>
  </div>
);

const CompanyDetail = ({ company, onClose }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold text-gray-800">{company.company_name}</h2>
      <button 
        className="text-gray-500 hover:text-gray-700 transition-colors"
        onClick={onClose}
      >
        <IoMdClose size={24} />
      </button>
    </div>
    <p className="text-gray-600 mb-6 leading-relaxed">{company.company_description}</p>
    <div className="grid grid-cols-2 gap-6">
      <DetailItem icon={<FaBriefcase />} label="Job Type" value={company.job_type} />
      <DetailItem icon={<FaBuilding />} label="Tier" value={company.tier} />
      <DetailItem icon={<FaMoneyBillWave />} label="Base Salary" value={`${company.base_salary} LPA`} />
      <DetailItem icon={<FaMoneyBillWave />} label="CTC" value={`${company.ctc} LPA`} />
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center">
    <div className="text-blue-500 mr-3">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-700">{label}</h4>
      <p className="text-gray-600">{value}</p>
    </div>
  </div>
);

export default function Home() {
    const [formData, setFormData] = useState({
      id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      company_placed_id: "",
      year_placed: "",
      linkedin_url: "",
      phone_number: "",
      remarks_markdown: "",
    });

    const [remarkState, setRemarkState] = useState(`Hello, **world!**`);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [backdrop, setBackdrop] = useState('blur');
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    tier: {},
    jobType: "",
    baseSalary: {},
    ctc: {},
    onlyFemales: false,
    internshipStipend: {},
    shortlistingCriteria: {},
    cgpa: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
      async function fetchCompanies() {
        try {
          const response = await fetch("/api/get-companies");
          const data = await response.json();
          setCompanies(data.result);
        } catch (error) {
          console.error("Error fetching companies:", error);
        }
      }
      fetchCompanies();
    }, []);

    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (value.length > 0) {
        const filtered = companies.filter((company) =>
          company.company_name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
  
    const handleSelectCompany = (company) => {
      setSearchQuery(company.company_name);
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedCompany(company);
      onOpen();
    };
  
    const filteredCompanies = companies.filter((company) =>
      company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCompanyChange = (company) => {
      setFormData((prevData) => ({ ...prevData, company_placed_id: company.id }));
      setSelectedCompany(company);
      onClose(); // Close the modal after selection
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Check for required fields
      const {
        first_name,
        last_name,
        year_placed,
        linkedin_url,
        company_placed_id,
        phone_number,
      } = formData;

      if (
        !first_name ||
        !last_name ||
        !year_placed ||
        !linkedin_url ||
        !company_placed_id
      ) {
        toast.error(
          "Please fill out all mandatory fields: Company ID, First Name, Last Name, Year Placed, and LinkedIn URL."
        );
        return;
      }

      // Validate LinkedIn URL
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
      if (!linkedinRegex.test(linkedin_url)) {
        toast.error("Please enter a valid LinkedIn URL.");
        return;
      }

      // Validate Phone Number
      const phoneRegex = /^[+]?[0-9]{10,15}$/; // Adjust the regex according to your phone number format requirements
      if (!phoneRegex.test(phone_number)) {
        toast.error("Please enter a valid phone number.");
        return;
      }

      const updatedFormData = {
        ...formData,
        remarks_markdown: remarkState,
      };

      try {
        const response = await fetch("/api/add-student-placed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFormData),
        });
        const result = await response.json();
        toast.success("Student data registered successfully!");
        toast.success(
          "Thank you for your contribution! You can review your work after a quick admin check :)"
        );
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to register student data. Please try again later.");
      }
    };

  return (
    <div className="flex h-screen">
      <FilterSidebar filters={filters} setFilters={setFilters} />
      <div className="flex-1 overflow-auto">
        <div className="h-fit flex flex-col items-center justify-center md:p-6 p-1 m-2">
          <Toaster />
          <H text={"Browse Companies! 👀"} />
          <P
            text={
              "Explore and filter through various companies that have visited our campus."
            }
          />
          <div className="w-full max-w-3xl mt-4 flex flex-col items-center relative">
            <div className="w-full relative">
              <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                className="pl-10 w-full"
                type="search"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden z-20">
              {suggestions.map((company) => (
                <div
                  key={company.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
                  onClick={() => handleSelectCompany(company)}
                >
                  <p className="text-sm font-medium text-gray-800">{company.company_name}</p>
                  <p className="text-xs text-gray-500 truncate">{company.company_description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
        <div className="mt-8 ml-4 mb-4 w-full flex flex-col items-start">
          {filteredCompanies.map((company) => (
            <CompanyCard 
            key={company.id} 
            company={company} 
            onClick={setSelectedCompany}
          />
          ))}
        </div>
        {selectedCompany && (
        <div className="w-1/3 p-6 bg-gray-50 overflow-auto">
          <CompanyDetail 
            company={selectedCompany} 
            onClose={() => setSelectedCompany(null)}
          />
        </div>
      )}
      </div>
      <Toaster />
    </div>
);
}