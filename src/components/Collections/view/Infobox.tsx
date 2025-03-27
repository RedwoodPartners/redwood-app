"use client";

import React, { useEffect, useState } from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID, PROJECTS_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [updatedStartDate, setUpdatedStartDate] = useState(projectData?.startDate || "");
  const [updatedEndDate, setUpdatedEndDate] = useState(projectData?.projectEndDate || "");


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
          setUpdatedStartDate(project.startDate || "");
          setUpdatedEndDate(project.projectEndDate || "");
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

  useEffect(() => {
    if (updatedStartDate && updatedStartDate !== "") {
      setUpdatedStartupStatus("In Progress");
    }
  }, [updatedStartDate]);
  

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
        let newStartupStatus = updatedStartupStatus;
        if (updatedStartDate && updatedStartDate !== "") {
          newStartupStatus = "In Progress";
        }

        await databases.updateDocument(STAGING_DATABASE_ID, PROJECTS_ID, projectId, {
          stage: updatedStage,
          startupStatus: updatedStartupStatus,
          startDate: updatedStartDate,
          projectEndDate: updatedEndDate,
        });
        setProjectData((prev) =>
          prev ? { 
            ...prev, 
            stage: updatedStage, 
            startupStatus: updatedStartupStatus,
            startDate: updatedStartDate,
            projectEndDate: updatedEndDate, 
          } : null
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
      {isEditing ? (
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
            <Label>Start Date</Label>
            <input
              type="date"
              value={updatedStartDate}
              onChange={(e) => {
                setUpdatedStartDate(e.target.value);
                if (e.target.value !== "") {
                  setUpdatedStartupStatus("In Progress");
                }
              }}
              className="border rounded px-2 py-1 text-sm"
            />
            </div>
            <div className="flex flex-col gap-2">
            <Label>End Date</Label>
            <input
              type="date"
              value={updatedEndDate}
              onChange={(e) => setUpdatedEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            </div>
          </div>
        ) : (
          <span className="text-black sm:text-base">
            {formatDate(projectData.startDate)} - {formatDate(projectData.projectEndDate)}
          </span>
        )}
        {projectData.services && (
          <span className="text-black font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
            {projectData.services}
          </span>
        )}

        {/* Editable Stage */}
        {projectData.projectTemplate === 'TANSIM' && (
          isEditing ? (
            <div className="w-36">
              <Label>TANSIM Stage</Label>
              <Select value={updatedStage} onValueChange={setUpdatedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Pre First Connect",
                    "First Connect",
                    "SME",
                    "Deep Dive",
                    "IM",
                    "IC",
                    "PSC",
                    "SHA",
                  ].map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              {projectData.stage && (
                <span className="text-black flex gap-2 font-medium border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
                  <div className="bg-red-500 rounded-full text-sm h-3 w-3 mt-1" />
                  {projectData.stage}
                </span>
              )}
            </>
          )
        )}

        {/* Editable Startup Status */}
        {isEditing ? (
          <div className="w-36">
            <Label>Project Status</Label>
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
          <>
          {projectData.startupStatus && (
            <span
              className={`border ${getBorderColor()} font-medium px-3 py-1 rounded-full text-xs sm:text-sm`}
            >
              {projectData.startupStatus}
            </span>
          )}
          </>
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
