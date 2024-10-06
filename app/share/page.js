"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation'


import { Spinner, Tooltip } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { CiLinkedin, CiPhone } from "react-icons/ci";
import Link from "next/link";

// Dynamically import the MarkdownReviewRenderer component
const MarkdownReviewRenderer = dynamic(
  () => import("../components/MarkdownReviewRenderer"),
  {
    ssr: true,
  }
);

export default function StudentPlacedDetails() {
  const searchParams = useSearchParams()
  const studentId = searchParams.get('q')
  // const { studentId } = router.query; // Fetch the studentPlacedId from the URL query
  const [studentData, setStudentData] = useState(null); // Store fetched student data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch the student data using the studentPlacedId
  useEffect(() => {
    if (studentId) { // Ensure router is ready and studentId is available
      async function fetchStudentDetails() {
        try {
          setLoading(true);
          const response = await fetch(
            `/api/getStudentPlacedById/${studentId}`
          );
          const data = await response.json();
          setStudentData(data[0]);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching student data:", error);
          setLoading(false);
        }
      }
      fetchStudentDetails();
    }
  }, [studentId]); // Add router.isReady as a dependency to avoid premature query access

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner color="warning" labelColor="warning">
          Loading student details...
        </Spinner>
      </div>
    );
  }

  // If student data is not found, show a message
  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No student data found, Whatcha pullin ?</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-center md:p-2 p-1">
      <div className="flex flex-col items-center justify-center w-full my-7">
        <h1 className="w-[100%] text-center text-4xl">
          {studentData?.first_name} {studentData?.last_name} 's Experience
        </h1>
        <div className="flex flex-row items-center justify-center gap-2">
          {studentData?.linkedin_url && (
            <Link href={studentData?.linkedin_url}>
              <CiLinkedin size={25} />
            </Link>
          )}
          {studentData?.phone_number && (
            <Tooltip content={studentData?.phone_number} className="text-xs">
              <div className="">
                <CiPhone size={25}/>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="w-[370px] md:w-[100%] ">
        <MarkdownReviewRenderer
          remarks_markdown={studentData.remarks_markdown}
          theme="dark"
        />
      </div>
    </div>
  );
}
