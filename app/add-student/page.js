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

// Dynamically import CkeditorForm to avoid server-side rendering issues
const CustomEditor = dynamic(() => import("../components/CkeditorForm"), {
  ssr: false,
});

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
    <div className="h-fit flex flex-col items-center justify-center md:p-6 p-1 m-2 ">
      <Toaster />
      <H text={"Add Your Experience!"} />
      <P
        text={
          "Congratulations on landing your new role! 🎉 We’re thrilled to have you here. As you embark on this exciting journey, we invite you to share your triumphs and experiences with the PES community. Your insights could be the beacon that guides other students and juniors to their own success."
        }
      />
      
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 place-items-center md:grid-cols-4 gap-4 p-[5px]"
      >
        <Button  
          variant="flat" 
          color="warning" 
          onPress={onOpen}
          className="capitalize"
        >
          {selectedCompany ? selectedCompany.company_name : "Select Company"}
        </Button>
        <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose} className = " p-3">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">Select a Company</ModalHeader>
            <ModalBody>
              {companies.length === 0 ? (
                <p>Loading companies...</p>
              ) : (
                <div className="flex flex-row flex-wrap gap-1 items-center justify-center">
                  {companies.map((company) => (
                    <>
                    
                    <Button
                      key={company.id}
                      color="success"
                      onPress={() => handleCompanyChange(company)}
                      className = "w-fit"
                      variant="light"
                    >
                      {company.company_name}
                    </Button>

                    </>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="success"  onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        <Input
          name="first_name"
          type="text"
          label="First Name"
          color="success"
          placeholder="Enter first name"
          value={formData.first_name}
          onChange={handleInputChange}
          className="max-w-full"
          required
        />
        <Input
          name="middle_name"
          type="text"
          label="Middle Name"
          color="success"
          placeholder="Enter middle name"
          value={formData.middle_name}
          onChange={handleInputChange}
          className="max-w-full"
        />
        <Input
          name="last_name"
          type="text"
          label="Last Name"
          color="success"
          placeholder="Enter last name"
          value={formData.last_name}
          onChange={handleInputChange}
          className="max-w-full"
          required
        />
        <Input
          name="year_placed"
          type="number"
          label="Year Placed"
          color="success"
          placeholder="Enter year placed"
          value={formData.year_placed}
          onChange={handleInputChange}
          className="max-w-full"
          required
        />
        <Input
          name="linkedin_url"
          type="text"
          label="LinkedIn URL"
          color="success"
          placeholder="Enter LinkedIn URL"
          value={formData.linkedin_url}
          onChange={handleInputChange}
          className="max-w-full"
          required
        />
        <Input
          name="phone_number"
          type="text"
          label="Phone Number"
          color="success"
          placeholder="Enter phone number"
          value={formData.phone_number}
          onChange={handleInputChange}
          className="max-w-full"
        />
        <Button
          type="submit"
          color="success"
          variant="shadow"
          className="mt-4"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </form>

      <CustomEditor remarkState={remarkState} setRemarkState={setRemarkState} />
    </div>
  );
}
