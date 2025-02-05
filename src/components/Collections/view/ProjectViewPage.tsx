"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECTS_ID, STARTUP_ID, API_ENDPOINT, PROJECT_ID } from "@/appwrite/config";
import InfoBox from "./Infobox";

type ProjectDetails = {
  id: string;
  name: string;
  startupId: string;
  startDate: string;
  receivedDate: string;
  projectEndDate: string;
  appliedFor: string;
  services: string;
  projectTemplate: string;
  startupStatus: string;
  stage: string;
};

type StartupDetails = {
  id: string;
  name: string;
};

const ProjectViewPage = ({ id }: { id: string }) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [startupData, setStartupData] = useState<StartupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchProjectDetails = async () => {
      try {
        // Fetch project details
        const response = await databases.getDocument(DATABASE_ID, PROJECTS_ID, id);
        setProject({
          id: response.$id,
          name: response.name || "",
          startupId: response.startupId || "",
          startDate: response.startDate || "",
          receivedDate: response.receivedDate || "",
          projectEndDate: response.projectEndDate || "",
          appliedFor: response.appliedFor || "",
          services: response.services || "",
          projectTemplate: response.projectTemplate || "",
          startupStatus: response.startupStatus || "",
          stage: response.stage || "",
        });

        // Fetch startup details based on startupId
        if (response.startupId) {
          const startupResponse = await databases.getDocument(DATABASE_ID, STARTUP_ID, response.startupId);
          setStartupData({
            id: startupResponse.$id,
            name: startupResponse.name || "Unknown Startup",
          });
        }
      } catch (error) {
        console.error("Error fetching project or startup details:", error);
        router.push("/projects"); // Redirect to projects page if ID is invalid
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, router]);

  if (loading) {
    return( 
    <>
    <div className="flex justify-center mt-56">
    <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
    <title id="title">Loading...</title>
    <circle cx="50" cy="50" r="35" stroke="gray" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="55 35">
    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
    </circle>
    </svg>
  </div>
    </>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <div className="p-3">
        <div>
        {startupData && (
          <div className="flex items-center space-x-2 mb-2">
            <button
                onClick={() => router.push(`/startup/${startupData.id}`)}
                className="text-2xl font-semibold text-gray-800 px-1 hover:text-blue-500 transition"
              >
                {startupData.name}
            </button>
          </div>
        )}
        </div>
        {/* Pass startupId as a prop to InfoBox */}
        {project.startupId && <InfoBox startupId={project.startupId} />}
      </div>
    </>
  );
};

export default ProjectViewPage;
