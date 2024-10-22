"use client";

import React, { useState, useEffect } from "react";
import { DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config";
import { HiOutlineMail, HiOutlinePhone, HiOutlineGlobeAlt } from "react-icons/hi";

import CompanyInformation from "@/components/Collections/view/CompanyInformation";
import FundingMilestones from "@/components/Collections/view/FundingMilestones";
import Compliance from "@/components/Collections/view/Compliance";
import Documents from "@/components/Collections/view/Documents";

interface StartupDetailsPageProps {
  startupId: string | undefined;
}

interface StartupData {
  name: string;
}

const StartupDetailsPage: React.FC<StartupDetailsPageProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("companyInfo");

  // Fetch startup details when the component is mounted
  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
          setStartupData({ name: data.name });
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
        }
      }
    };
    fetchStartupDetails();
  }, [startupId]);

  // Debugging active tab state
  useEffect(() => {
    console.log("Active Tab:", activeTab);
  }, [activeTab]);

  // Function to render content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "companyInfo":
        return <CompanyInformation />;
      case "fundingMilestones":
        return <FundingMilestones />;
      case "compliance":
        return <Compliance />;
      case "documents":
        return <Documents />;
      default:
        return null;
    }
  };

  return (
    <div className="container w-11/12 ml-20 p-1">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {startupData ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-gray-600">
                <span className="font-bold text-lg">{startupData.name.charAt(0)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{startupData.name}</h1>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-center justify-between p-1 mx-auto rounded-xl border border-gray-300">
            <div className="flex flex-wrap items-center space-x-4">
              <span className="font-semibold text-gray-700">₹2 Cr</span>
              <span className="font-semibold text-gray-700">20 Jun 2024 - 12 Nov 2024</span>
              <span className="flex items-center space-x-2">
                <span className="bg-red-500 h-2 w-2 rounded-full"></span>
                <span className="text-gray-700">TANSIM</span>
              </span>
              <span className="text-gray-700 border border-gray-300 px-3 rounded-full">Equity</span>
              <span className="text-gray-700 border border-gray-300 px-3 rounded-full">Deep Dive</span>
              <button className="border border-blue-500 text-blue-500 px-3 rounded-full hover:bg-blue-500 hover:text-white transition">
                Pipeline
              </button>
              <button className="text-blue-500 underline hover:text-blue-700 transition">
                Add Profile Info
              </button>
              
            </div>
            <div className="flex items-center space-x-6 text-black hover:text-gray-700 transition-colors duration-200 ease-in-out">
              <HiOutlineMail className="h-10 w-6 cursor-pointer" />
              <HiOutlinePhone className="h-10 w-6 cursor-pointer" />
              <HiOutlineGlobeAlt className="h-10 w-6 cursor-pointer" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mb-3 mt-4 border-b-2 border-black">
            <button
              className={`font-semibold pb-2 ${activeTab === "companyInfo" ? "border-b-2 border-black" : "text-gray-600"}`}
              onClick={() => setActiveTab("companyInfo")}
            >
              Company Information
            </button>
            <button
              className={`font-semibold pb-2 ${activeTab === "fundingMilestones" ? "border-b-2 border-black" : "text-gray-600"}`}
              onClick={() => setActiveTab("fundingMilestones")}
            >
              Funding & Milestones
            </button>
            <button
              className={`font-semibold pb-2 ${activeTab === "compliance" ? "border-b-2 border-black" : "text-gray-600"}`}
              onClick={() => setActiveTab("compliance")}
            >
              Compliance
            </button>
            <button
              className={`font-semibold pb-2 ${activeTab === "documents" ? "border-b-2 border-black" : "text-gray-600"}`}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
          </div>

          {/* Render Tab Content */}
          {renderTabContent()}

          {/* Save Buttons */}
          <div className="flex justify-end mt-10 space-x-2 mr-52">
            <button className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition">Save</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
              Save & Keep Working
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default StartupDetailsPage;
