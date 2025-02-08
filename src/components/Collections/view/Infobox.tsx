"use client";

import React, { useEffect, useState } from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { Client, Databases, Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT, PROJECTS_ID } from "@/appwrite/config";

type Project = {
  startDate: string;
  projectEndDate: string;
  projectTemplate: string;
  services: string;
  appliedFor: string;
  stage: string;
  startupStatus: string;
};

interface InfoBoxProps {
  startupId: string; // Prop passed from the detailed page
  projectId: string; // Prop passed from the detailed page
}

const InfoBox: React.FC<InfoBoxProps> = ({ startupId, projectId }) => {
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
          Query.equal("$id", projectId),
        ]);

        if (response.documents.length > 0) {
          // Assuming we display the first matching project
          const project = response.documents[0];
          setProjectData({
            startDate: project.startDate || "",
            projectEndDate: project.projectEndDate || "",
            projectTemplate: project.projectTemplate || "",
            appliedFor: project.appliedFor || "",
            services: project.services || "",
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
  }, [startupId, projectId]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };
  // Determine border color based on the status
  const getBorderColor = (): string => {
    if (projectData?.startupStatus === "Completed") return "border-green-500 text-green-500";
    if (projectData?.startupStatus === "Rejected") return "border-red-500 text-red-500";
    if (projectData?.startupStatus === "Pipeline") return "border-blue-500 text-blue-500";
    return "border-gray-300"; // Default border color
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
        <span className="font-medium text-gray-950 text-xs sm:text-base">
          ₹NA
        </span>
        <span className="text-gray-950 font-medium text-xs sm:text-base">
          {formatDate(projectData.startDate)} -{" "}
          {formatDate(projectData.projectEndDate)}
        </span>
        <span className="text-gray-950 font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          {projectData.services}
        </span>
        <span className="text-gray-950 flex gap-2 font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
        <div className="bg-blue-500 rounded-full text-sm h-3 w-3 mt-1" />{projectData.appliedFor}
        </span>
        <span className="text-gray-950 flex gap-2 font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          <div className="bg-red-500 rounded-full text-sm h-3 w-3 mt-1" />{projectData.stage}
        </span>
        <button className={`border ${getBorderColor()} font-medium px-3 py-1 rounded-full text-xs sm:text-sm`}>
          {projectData.startupStatus}
        </button>
        <span className="text-blue-500 font-semibold text-xs sm:text-sm cursor-pointer">
          Add Profile Info
        </span>
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
