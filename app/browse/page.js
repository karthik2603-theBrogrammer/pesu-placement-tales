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
          <H text={"Browse Companies! 👀"} />
          <P
            text={
              ""
            }
          />
        </div>
    // <div>
    //     deded
    //     <P>ddd</P>
    //     <H>Browse Companies</H>
    // </div>
  );
}
