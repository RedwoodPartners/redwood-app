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

      // Helper functions
      const addPage = () => {
        doc.addPage();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
      };

      const addSectionTitle = (title: string, y: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204); // Blue color
        doc.text(title, 20, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
      };

      const addBorderedSection = (y: number, height: number) => {
        doc.setDrawColor(0, 102, 204); // Blue color
        doc.setLineWidth(0.5);
        doc.rect(15, y - 5, 180, height);
      };

      // Title Page
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(153, 0, 0); // Dark red with some black
      doc.text("Redwood Partners", 105, 50, { align: "center" });
      doc.text("FIRST CONNECT REPORT", 105, 70, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0); // Black color
      doc.text(`Brand: ${startupData.brandName}`, 105, 100, { align: "center" });
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 105, 120, { align: "center" });

      // Additional Pages and Content (add logic as needed)
      addPage();
      addSectionTitle("Company Details:", 20);
      addBorderedSection(15, 30);

      addSectionTitle("Cap Table:", 60);
      addBorderedSection(55, 30);
      doc.text("Applicable only for Pvt Ltd entity – else NA", 20, 75);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);

      // Save PDF
      doc.save(`${startupData.name}_First_Connect_Report.pdf`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  return (
    <button id="generateReportBtn" style={{ display: "none" }} onClick={handleGenerateReport}>
      Generate Report
    </button>
  );
};

export default GenerateReport;
