"use client";

import React from "react";
import jsPDF from "jspdf";
import { databases } from "@/appwrite/config";
import { DATABASE_ID, STARTUP_ID } from "@/appwrite/config";

interface GenerateReportProps {
  startupId: string;
}

const GenerateReport: React.FC<GenerateReportProps> = ({ startupId }) => {
  const handleGenerateReport = async () => {
    try {
      const startupData = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
      const doc = new jsPDF();

      // ... (rest of the PDF generation code remains the same)

      doc.save(`${startupData.name}_First_Connect_Report.pdf`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  return (
    <div
      id="generateReportBtn"
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
      style={{ display: "none" }}
      onClick={handleGenerateReport}
    >
      Generate Report
    </div>
  );
};

export default GenerateReport;
