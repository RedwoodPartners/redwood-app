"use client";

import React, { useEffect, useState } from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID, PROJECTS_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import { FUNDING_ID } from "./FundingMilestonestabs/FundAsk";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  startupId: string;
  projectId: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ startupId, projectId }) => {
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [validatedFund, setValidatedFund] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedStage, setUpdatedStage] = useState<string>("");
  const [updatedStartupStatus, setUpdatedStartupStatus] = useState<string>("");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Query projects collection for matching startupId
        const response = await databases.listDocuments(STAGING_DATABASE_ID, PROJECTS_ID, [
          Query.equal("startupId", startupId),
          Query.equal("$id", projectId),
        ]);

        if (response.documents.length > 0) {
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
          setUpdatedStage(project.stage || "");
          setUpdatedStartupStatus(project.startupStatus || "");
        } else {
          console.warn("No projects found for this startup.");
        }

        // Fetch Funding Data
        const fundingResponse = await databases.listDocuments(STAGING_DATABASE_ID, FUNDING_ID, [
          Query.equal("startupId", startupId),
        ]);

        if (fundingResponse.documents.length > 0) {
          const funding = fundingResponse.documents[0];
          setValidatedFund(funding.validatedFund || null); // Set validatedFund value
        } else {
          console.warn("No funding data found for this startup.");
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

  const getBorderColor = (): string => {
    if (projectData?.startupStatus === "Completed") return "border-green-500 text-green-500";
    if (projectData?.startupStatus === "Rejected") return "border-red-500 text-red-500";
    if (projectData?.startupStatus === "Pipeline") return "border-blue-500 text-blue-500";
    return "border-gray-300"; // Default border color
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      if (projectData) {
        await databases.updateDocument(STAGING_DATABASE_ID, PROJECTS_ID, projectId, {
          stage: updatedStage,
          startupStatus: updatedStartupStatus,
        });
        setProjectData((prev) =>
          prev ? { ...prev, stage: updatedStage, startupStatus: updatedStartupStatus } : null
        );
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-2 mx-auto rounded-xl border border-gray-300 space-y-4 sm:space-y-0">
        Loading...
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex flex-wrap items-center justify-between p-2 mx-auto rounded-xl border border-gray-300 space-y-4 sm:space-y-0">
        No projects found for this startup.
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
      <div className="flex flex-wrap items-center space-x-4 space-y-2 sm:space-y-0">
        <span className="font-medium text-gray-950 text-xs sm:text-base">
          {validatedFund !== null && !isNaN(Number(validatedFund.toString().replace(/[₹,]/g, "")))
            ? `₹ ${(Number(validatedFund.toString().replace(/[₹,]/g, "")) / 10000000).toFixed(2)} Cr`
            : "NA"}
        </span>
        <span className="text-gray-950 font-medium text-xs sm:text-base">
          {formatDate(projectData.startDate)} - {formatDate(projectData.projectEndDate)}
        </span>
        <span className="text-gray-950 font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          {projectData.services}
        </span>

        {/* Editable Stage */}
        {isEditing ? (
          <div className="w-28">
          <Select value={updatedStage} onValueChange={setUpdatedStage}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Deep Dive",
                "First Connect",
                "Fund Release",
                "IC",
                "Pre First Connect",
                "PSC",
                "SME",
              ].map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        ) : (
          <span className="text-gray-950 flex gap-2 font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
            <div className="bg-red-500 rounded-full text-sm h-3 w-3 mt-1" />
            {projectData.stage}
          </span>
        )}

        {/* Editable Startup Status */}
        {isEditing ? (
          <div className="w-28">
          <Select value={updatedStartupStatus} onValueChange={setUpdatedStartupStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Pipeline",
                "In Progress",
                "On Hold",
                "Non Responsive",
                "Backed out",
                "Rejected",
                "Completed",
              ].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        ) : (
          <span
            className={`border ${getBorderColor()} font-medium px-3 py-1 rounded-full text-xs sm:text-sm`}
          >
            {projectData.startupStatus}
          </span>
        )}

        {/* Update/Save Button */}
        {!isEditing ? (
          <span
            onClick={handleUpdateClick}
            className="text-blue-500 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            update
          </span>
        ) : (
          <span
            onClick={handleSaveClick}
            className="text-green-500 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            save
          </span>
        )}
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
