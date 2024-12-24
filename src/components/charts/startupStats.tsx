"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { Client, Databases } from 'appwrite';
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from '@/appwrite/config';

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue: string;
  icon: React.ReactNode;
}

const StartupStats: React.FC = () => {
  const [startupCount, setStartupCount] = useState<number>(0);
  const [pipelineCount, setPipelineCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  useEffect(() => {
    const fetchStartupStats = async () => {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const database = new Databases(client);

      try {
        const response = await database.listDocuments(DATABASE_ID, STARTUP_ID);
        setStartupCount(response.total);

        // Assuming you have fields for status in your documents
        const pipelineStartups = response.documents.filter(doc => doc.status === 'pipeline').length;
        const rejectedStartups = response.documents.filter(doc => doc.status === 'rejected').length;
        const completedStartups = response.documents.filter(doc => doc.status === 'completed').length;

        setPipelineCount(pipelineStartups);
        setRejectedCount(rejectedStartups);
        setCompletedCount(completedStartups);
      } catch(error) {
        console.error("Error fetching startups data:", error);
      }
    };

    fetchStartupStats();
  }, []);
  
  const calculatePercentageChange = (currentCount: number, previousCount: number): string => {
    if (previousCount === 0) return "+0%";
    const percentageChange = ((currentCount - previousCount) / previousCount) * 100;
    return `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}% from last month`;
  };

  return (
    <div className="flex flex-wrap justify-around p-1">
      <StatCard
        title="Total Startups"
        mainValue={startupCount}
        subValue={calculatePercentageChange(startupCount, startupCount - 1)}
        icon={
          <svg
            className="w-5 h-5"
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
      />
      <StatCard
        title="Pipeline Startups"
        mainValue={pipelineCount}
        subValue={calculatePercentageChange(pipelineCount, pipelineCount)}
        icon={
          <svg
            className="w-5 h-5 text-blue-500"
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
      />
      <StatCard
        title="Rejected Startups"
        mainValue={rejectedCount}
        subValue={calculatePercentageChange(rejectedCount, rejectedCount)}
        icon={
          <svg
            className="w-5 h-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        }
      />
      <StatCard
        title="Completed Startups"
        mainValue={completedCount}
        subValue={`+${completedCount} since last year`}
        icon={
          <svg
            className="w-5 h-5 text-green-500"
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
      />
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, mainValue, subValue, icon }) => {
  return (
    <div className="bg-white rounded-xl p-2 w-72 mt-2 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
        <span className="text-gray-600">{icon}</span>
      </div>
      <h2 className="text-xl font-semibold mb-1">{mainValue}</h2>
      <p className="text-xs text-gray-500">{subValue}</p>
    </div>
  );
};

export default StartupStats;
