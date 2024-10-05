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
import { FaBuilding, FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaFilter } from "react-icons/fa";
// Dynamically import CkeditorForm to avoid server-side rendering issues
const CustomEditor = dynamic(() => import("../components/CkeditorForm"), {
  ssr: false,
});

const CompanyCard = ({ company, onClick, isSelected }) => (
  <div 
    className={`bg-white p-4 md:p-6 rounded-lg shadow-md cursor-pointer transition-all duration-200 border ${
      isSelected ? 'border-green-500 shadow-lg' : 'border-gray-200 hover:shadow-lg'
    }`}
    onClick={() => onClick(company)}
  >
    <div className="flex items-center justify-between mb-2 md:mb-4">
      <div className="flex items-center">
        <FaBuilding className="text-yellow-500 mr-2 md:mr-3 text-lg md:text-xl" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">{company.company_name}</h3>
      </div>
      <div className="flex items-center text-xs md:text-sm text-gray-500">
        <FaBriefcase className="mr-1" /> 
        <span>{company.job_type}</span>
      </div>
    </div>
    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4">{company.company_description}</p>
    <div className="flex justify-between text-xs md:text-sm text-gray-500">
      <span className="flex items-center"><FaMoneyBillWave className="mr-1" /> Base: {company.base_salary} LPA</span>
      <span className="flex items-center"><FaMoneyBillWave className="mr-1" /> CTC: {company.ctc} LPA</span>
    </div>
  </div>
);

const CompanyDetail = ({ company, onClose }) => (
  <div className="bg-white p-4 md:p-8 rounded-lg h-full overflow-auto">
    <div className="flex justify-between items-center mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{company.company_name}</h2>
      <button 
        className="text-gray-500 hover:text-gray-700 transition-colors md:hidden"
        onClick={onClose}
      >
        <IoMdClose size={24} />
      </button>
    </div>
    <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">{company.company_description}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <DetailItem icon={<FaBriefcase />} label="Job Type" value={company.job_type} />
      <DetailItem icon={<FaBuilding />} label="Tier" value={company.tier} />
      <DetailItem icon={<FaMoneyBillWave />} label="Base Salary" value={`${company.base_salary} LPA`} />
      <DetailItem icon={<FaMoneyBillWave />} label="CTC" value={`${company.ctc} LPA`} />
      <DetailItem icon={<FaMapMarkerAlt />} label="Location" value={company.location || "Not specified"} />
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center bg-gray-50 p-2 md:p-3 rounded-md">
    <div className="text-yellow-500 mr-2 md:mr-3">{icon}</div>
    <div>
      <h4 className="font-semibold text-sm md:text-base text-gray-700">{label}</h4>
      <p className="text-xs md:text-sm text-gray-600">{value}</p>
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
    baseSalary: [0, 90],
    ctc: [0, 90],
    onlyFemales: false,
    internshipStipend: [0, 90],
    shortlistingCriteria: {},
    cgpa: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

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
    const toggleFilterSidebar = () => {
      setShowFilterSidebar(!showFilterSidebar);
    };
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <div className="flex-shrink-0">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>
        <Modal 
        isOpen={showFilterSidebar} 
        onClose={() => setShowFilterSidebar(false)}
        className="md:hidden"
      >
        <ModalContent>
          <ModalHeader>Filters</ModalHeader>
          <ModalBody>
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Toaster position="top-center" />
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Browse Companies 👀</h1>
            <p className="text-lg md:text-xl text-gray-600">
              Explore companies that have visited our campus.
            </p>
          </div>
          
          <div className="mb-8 max-w-3xl mx-auto relative">
            <div className="relative flex items-center">
              <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <Input
                className="pl-10 w-full border-2 border-gray-300 rounded-md"
                size="lg"
                type="search"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Button
                className="ml-2 bg-blue-500 text-white md:hidden"
                onClick={toggleFilterSidebar}
              >
                <FaFilter />
              </Button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden z-20">
                {suggestions.map((company) => (
                  <div
                    key={company.id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
                    onClick={() => handleSelectCompany(company)}
                  >
                    <p className="text-sm font-medium text-gray-800">{company.company_name}</p>
                    <p className="text-xs text-gray-500 truncate">{company.company_description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              <div className="space-y-4 md:space-y-6">
                {filteredCompanies.map((company) => (
                  <CompanyCard 
                    key={company.id} 
                    company={company} 
                    onClick={setSelectedCompany}
                    isSelected={selectedCompany && selectedCompany.id === company.id}
                  />
                ))} 
              </div>
            </div>
            <div className="w-full lg:w-2/3 lg:border-l lg:border-gray-200 lg:pl-8">
              {selectedCompany ? (
                <CompanyDetail 
                  company={selectedCompany} 
                  onClose={() => setSelectedCompany(null)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Select a company to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}