"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { STAGING_DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config";
import CompanyInformation from "@/components/Collections/view/CompanyInformation";
import RegulatoryInformation from "@/components/Collections/view/CompanyInfotabs/RegulatoryInformation";
import Contact from "@/components/Collections/view/CompanyInfotabs/Contact";
import { Download } from "lucide-react";
import GenerateReport from '@/components/generate';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import LoadingSpinner from "@/components/ui/loading";

interface StartupDetailsPageProps {
  startupId: string;
}

interface StartupData {
  name: string;
}

const StartupDetailsPage: React.FC<StartupDetailsPageProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("companyInfo");

  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(STAGING_DATABASE_ID, STARTUP_ID, startupId);
          setStartupData({ name: data.name });
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
        }
      }
    };
    fetchStartupDetails();
  }, [startupId]);


  return (
    <div className="p-2">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {startupData ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
              <Label className="text-2xl font-semibold text-gray-800 p-2">{startupData.name}</Label>
            {/* Download Button to generate report */}
            <div className="mr-5 border border-gray-100 rounded-2xl ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                  <GenerateReport startupId={startupId} />
                  <div onClick={() => document.getElementById("generateReportBtn")?.click()} className="hover:text-red-500 transition-colors duration-300">
                    <Download className="" />
                  </div>
                  </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate First Connect Report</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Company Details */}
          <div className="p-2">
            <CompanyInformation startupId={startupId} activeTab={activeTab} setActiveTab={setActiveTab} />
            <RegulatoryInformation startupId={startupId} />
            <Contact startupId={startupId} />
          </div>
          
        </>
      ) : (
        /*Loading*/
        <div className="flex justify-center mt-38">
          <LoadingSpinner />
        </div>

      )}
    </div>
  );
};

export default StartupDetailsPage;
