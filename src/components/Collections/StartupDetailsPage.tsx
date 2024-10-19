"use client";
import React, { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaGlobe } from "react-icons/fa";
import { DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config";

interface StartupDetailsPageProps {
  startupId: string | undefined;
}

interface StartupData {
  name: string;
}

const StartupDetailsPage: React.FC<StartupDetailsPageProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Dummy data for other fields
  const dummyFunding = "₹2 Cr";
  const dummyTimeline = "20 Jun 2024 - 12 Nov 2024";

  return (
    <div className="container w-11/12 ml-20 p-2">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {startupData ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-gray-600">
                {/* Placeholder for logo or image */}
                <span className="font-bold text-lg">{startupData.name.charAt(0)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{startupData.name}</h1>
            </div>
            <div className="flex items-center space-x-6 text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out">
              <FaEnvelope className="h-5 w-5 cursor-pointer" />
              <FaPhone className="h-5 w-5 cursor-pointer" />
              <FaGlobe className="h-5 w-5 cursor-pointer" />
            </div>
          </div>

          {/* Info Box */}
          <div className="flex flex-wrap items-center justify-start space-x-6 p-2 rounded-2xl border border-gray-300">
            <span className="font-semibold text-gray-700">{dummyFunding}</span>
            <span className="font-semibold text-gray-700">{dummyTimeline}</span>
            <span className="flex items-center space-x-2">
              <span className="bg-red-500 h-2 w-2 rounded-full"></span>
              <span className="text-gray-700">TANSIM</span>
            </span>
            <span className="text-gray-700 border border-gray-300 px-3 py-1 rounded-full">Equity</span>
            <span className="text-gray-700 border border-gray-300 px-3 py-1 rounded-full">Deep Dive</span>
            <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-full hover:bg-blue-500 hover:text-white transition">Pipeline</button>
            <button className="text-blue-500 underline hover:text-blue-700 transition">Add Profile Info</button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default StartupDetailsPage;
