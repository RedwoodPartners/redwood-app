import React from 'react';

interface StatCardProps {
  title: string;
  mainValue: string;
  subValue: string;
  icon: React.ReactNode;
}

const StartupStats: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-around p-1">
      <StatCard
        title="Total Startups"
        mainValue="+600"
        subValue="+20.1% from last month"
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
        mainValue="+50"
        subValue="+180.1% from last month"
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
        mainValue="+350"
        subValue="+19% from last year"
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
        mainValue="+200"
        subValue="+100 since last year"
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
