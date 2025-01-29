"use client";

import React, { useEffect, useState } from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { Client, Databases, Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT, PROJECTS_ID } from "@/appwrite/config";

type Project = {
  startDate: string;
  projectEndDate: string;
  projectTemplate: string;
  stage: string;
  startupStatus: string;
};

interface InfoBoxProps {
  startupId: string; // Prop passed from the detailed page
}

const InfoBox: React.FC<InfoBoxProps> = ({ startupId }) => {
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchProjectData = async () => {
      try {
        // Query projects collection for matching startupId
        const response = await databases.listDocuments(DATABASE_ID, PROJECTS_ID, [
          Query.equal("startupId", startupId),
        ]);

        if (response.documents.length > 0) {
          // Assuming we display the first matching project
          const project = response.documents[0];
          setProjectData({
            startDate: project.startDate || "",
            projectEndDate: project.projectEndDate || "",
            projectTemplate: project.projectTemplate || "",
            stage: project.stage || "",
            startupStatus: project.startupStatus || "",
          });
        } else {
          console.warn("No projects found for this startup.");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [startupId]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return <div className="p-2 mx-auto rounded-xl border border-gray-300 space-y-4 sm:space-y-0">
      Loading...</div>;
  }

  if (!projectData) {
    return (
      <div className="flex flex-wrap items-center justify-between p-2 mx-auto rounded-xl border border-gray-300 space-y-4 sm:space-y-0">
        No projects found for this startup.
        {/* Right Section */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-black hover:text-gray-700 transition-colors duration-200 ease-in-out">
          <Mail className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
          <MessageCircle className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
          <Globe className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between p-2 mx-auto rounded-xl border border-gray-300 space-y-4 sm:space-y-0">
      {/* Left Section */}
      <div className="flex flex-wrap items-center space-x-4 space-y-2 sm:space-y-0">
        <span className="font-normal text-gray-700 text-xs sm:text-base">
          ₹NA
        </span>
        <span className="text-gray-700 text-xs sm:text-base">
          {formatDate(projectData.startDate)} -{" "}
          {formatDate(projectData.projectEndDate)}
        </span>
        <span className="text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          {projectData.projectTemplate}
        </span>
        <span className="text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          {projectData.stage}
        </span>
        <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition">
          {projectData.startupStatus}
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 sm:space-x-6 text-black hover:text-gray-700 transition-colors duration-200 ease-in-out">
        <Mail className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
        <MessageCircle className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
        <Globe className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
};

export default InfoBox;
