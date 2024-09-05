"use client"

import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import H from "../components/Heading"
import P from "../components/Paragraph"

import { Toaster, toast } from 'sonner'

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
  const [companies, setCompanies] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/get-companies");
        const data = await response.json();
        setCompanies(data.result);
        // console.log(data.result);
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      toast.success('Student Data Registered Successfully!')
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="h-fit flex flex-col items-center justify-center p-6 m-4">
      <Toaster />
      <H text={"Add Your Experience!"} />
      <P
        text={
          "Welcome Student to this page! Wishing you a warm congratulations on securing your offer. Make your contribution by sharing your experience with everyone in the PES community. Your words and experience will help students/ juniors for years to come {':)'}"
        }
      />
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 place-items-center md:grid-cols-4 gap-4 "
      >
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
              {selectedCompany ? selectedCompany.company_name : "Select Company"}
            </Button>
          </DropdownTrigger>

          {companies === null ? (
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="fetching" className="text-danger" color="danger">
                Fetching Companies... Hold On
              </DropdownItem>
            </DropdownMenu>
          ) : (
            <DropdownMenu aria-label="Company Selection">
              {companies.map((company) => (
                <DropdownItem
                  key={company.id}
                  className="text-success"
                  color="success"
                  onClick={() => handleCompanyChange(company)}
                >
                  {company.company_name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </Dropdown>
        <Input
          name="first_name"
          type="text"
          label="First Name"
          color="success"
          placeholder="Enter first name"
          value={formData.first_name}
          onChange={handleInputChange}
          className="max-w-full"
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
        />
        <Input
          name="year_placed"
          type="text"
          label="Year Placed"
          color="success"
          placeholder="Enter year placed"
          value={formData.year_placed}
          onChange={handleInputChange}
          className="max-w-full"
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
      </form>

      <CustomEditor remarkState={remarkState} setRemarkState={setRemarkState} />
      <Button type="submit" className="mt-4" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
}
