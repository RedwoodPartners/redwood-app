"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Databases } from 'appwrite';
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from '@/appwrite/config';

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const StartupStats: React.FC = () => {
  const [startupCount, setStartupCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchStartupCount = async () => {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const database = new Databases(client);

      try {
        const response = await database.listDocuments(DATABASE_ID, STARTUP_ID);
        setStartupCount(response.total);
      } catch (error) {
        console.error("Error fetching startups count:", error);
      }
    };

    fetchStartupCount();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      <StatCard
        title="Total Startups"
        mainValue={startupCount}
        subValue="+1% from last month"
        onClick={() => router.push("/startup")}
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
        
      />
      <StatCard
        title="Pipeline Startups"
        mainValue="0"
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
      />
      <StatCard
        title="Rejected Startups"
        mainValue="0"
        subValue="+0% from last year"
        icon={
          <svg
            className="w-6 h-5 text-red-500"
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
        mainValue="0"
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
      />
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, mainValue, subValue, icon, onClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 max-w-full h-20 sm:max-w-sm" onClick={onClick}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-600 p-2">{title}</h3>
        <span className="text-gray-600 mr-2">{icon}</span>
      </div>
      <h2 className="text-xl font-semibold mb-2 ml-3 -mt-4">+{mainValue}</h2>
      {/*<p className="text-sm text-gray-500 ml-3">{subValue}</p>*/}
    </div>
  );
};

export default StartupStats;
