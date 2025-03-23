"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID, PROJECTS_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const ProjectStats: React.FC = () => {
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [ongoingProjects, setOngoingProjects] = useState<number>(0);
  const [completedProjects, setCompletedProjects] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchTotalProjects = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, PROJECTS_ID);
        setTotalProjects(response.total);
      } catch (error) {
        console.error("Error fetching total projects:", error);
      }
    };

    {/*const fetchStatusCounts = async () => {
      try {
        // Ongoing Projects
        const ongoingResponse = await databases.listDocuments(
          STAGING_DATABASE_ID,
          PROJECTS_ID,
          [Query.equal("projectStatus", "Ongoing")]
        );
        setOngoingProjects(ongoingResponse.total);

        // Completed Projects
        const completedResponse = await databases.listDocuments(
          STAGING_DATABASE_ID,
          PROJECTS_ID,
          [Query.equal("projectStatus", "Completed")]
        );
        setCompletedProjects(completedResponse.total);
      } catch (error) {
        console.error("Error fetching status counts:", error);
      }
    };*/}

    fetchTotalProjects();
    {/*fetchStatusCounts();*/}
  }, []);

  const statCards = [
    <StatCard
      key="total-projects"
      title="Total Projects"
      mainValue={`+${totalProjects}`}
      subValue="+1% from last month"
      onClick={() => router.push("/projects")}
      icon={
        <svg
          className="w-6 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      }
    />,
    <StatCard
      key="ongoing-projects"
      title="Ongoing Projects"
      mainValue={`+${ongoingProjects}`}
      subValue="+0% from last month"
      icon={
        <svg
          className="w-6 h-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      }
    />,
    <StatCard
      key="completed-projects"
      title="Completed Projects"
      mainValue={`+${completedProjects}`}
      subValue="+0 since last year"
      icon={
        <svg
          className="w-6 h-5 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      }
    />,
  ];

  const gridClass = "lg:grid-cols-5";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${gridClass} gap-4 p-2`}>
      {statCards}
    </div>
  );
};

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, mainValue, subValue, icon, onClick }) => {
  return (
    <div className="bg-white rounded-xl border max-w-full border-gray-200 h-20 sm:max-w-sm cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-600 p-2">{title}</h3>
        <span className="text-gray-600 mr-2">{icon}</span>
      </div>
      <h2 className="text-lg font-semibold mb-2 ml-3 -mt-4">{mainValue}</h2>
    </div>
  );
};

export default ProjectStats;
