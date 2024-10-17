import React, { useEffect, useState } from "react";

import { DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config"; // Importing from config

interface StartupDetailsPageProps {
  startupId: string | undefined;
}

interface StartupData {
  id: string;
  name: string;
  status: string;
  founded: string;
  description: string;
}

const StartupDetailsPage: React.FC<StartupDetailsPageProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          // Fetch document from Appwrite using the imported DATABASE_ID and STARTUP_ID
          const data = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
          
          
          const startupDetails: StartupData = {
            id: data.$id,
            name: data.name,
            status: data.status,
            founded: data.founded,
            description: data.description,
          };

          setStartupData(startupDetails);
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
        }
      }
    };

    fetchStartupDetails();
  }, [startupId]);

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      {startupData ? (
        <div className="p-20">
          <h1>{startupData.name}</h1>
          <p>{startupData.description}</p>
          <p>Status: {startupData.status}</p>
          <p>Founded: {new Date(startupData.founded).toLocaleDateString()}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen w-full">
          <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-solid border-opacity-75"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>


      )}
    </div>
  );
};

export default StartupDetailsPage;
