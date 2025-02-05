"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECTS_ID, API_ENDPOINT, PROJECT_ID } from "@/appwrite/config";

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

const ProjectDetailsPage = ({ params }: { params: { id: string } }) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchProjectDetails = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching project details:", error);
        router.push("/projects"); // Redirect to projects page if ID is invalid
      }
    };

    fetchProjectDetails();
  }, [id, router]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Project Details</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <p><strong>Startup Name:</strong> {project.name}</p>
        <p><strong>Start Date:</strong> {project.startDate}</p>
        <p><strong>Received Date:</strong> {project.receivedDate}</p>
        <p><strong>Project End Date:</strong> {project.projectEndDate}</p>
        <p><strong>Applied For:</strong> {project.appliedFor}</p>
        <p><strong>Services:</strong> {project.services}</p>
        <p><strong>Project Template:</strong> {project.projectTemplate}</p>
        <p><strong>Startup Status:</strong> {project.startupStatus}</p>
        <p><strong>Stage:</strong> {project.stage}</p>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
