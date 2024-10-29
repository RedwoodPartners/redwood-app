"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { EditIcon, SaveIcon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";

export const ABOUT_ID = "67207029001de651f13d";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);

const AboutBusiness: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.getDocument(DATABASE_ID, ABOUT_ID, ABOUT_ID);
        setData(response);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);

          if (error.message.includes("Document with the requested ID could not be found.")) {
            setData({});
          }
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };
    
    fetchData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (data.$id) {
        // Update existing document
        await databases.updateDocument(DATABASE_ID, ABOUT_ID, data.$id, data);
      } else {
        // Create a new document if it doesn't exist
        const response = await databases.createDocument(DATABASE_ID, ABOUT_ID, "unique()", data);
        setData(response); // Update state with the new document data including the ID
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center">
        <h2 className="container text-xl font-bold mb-4 -mt-6">About Business</h2>
        <EditIcon size={25} className="-mt-6 cursor-pointer" onClick={handleEdit} />
        {isEditing && (
          <div
            onClick={handleSave}
            className="-mt-6 ml-5 cursor-pointer"
          >
            <SaveIcon size={25} />
          </div>
        )}
      </div>
      <AccordionDemo
        data={data}
        isEditing={isEditing}
        onChange={handleChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default AboutBusiness;

interface AccordionDemoProps {
  data: { [key: string]: string | null };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
}

const AccordionDemo: React.FC<AccordionDemoProps> = ({
  data,
  isEditing,
  onChange,
  onSave,
}) => {
  const fields = [
    { id: "problemStatement", label: "Problem Statement" },
    { id: "solutionStage", label: "Current Stage of Solution/Idea" },
    { id: "businessLines", label: "Other Current Business Lines" },
    { id: "futureLines", label: "Future Business Lines" },
    { id: "marketOverview", label: "Market Overview" },
    { id: "solutionOverview", label: "Solution Overview" },
    { id: "competition", label: "Competition" },
    { id: "opportunityAnalysis", label: "Opportunity Analysis" },
  ];

  return (
    <Accordion type="single" collapsible>
      {fields.map((field) => (
        <AccordionItem
          key={field.id}
          value={field.id}
          className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <AccordionTrigger className="text-sm font-semibold">
            {field.label}
          </AccordionTrigger>
          <AccordionContent className="mt-2 text-gray-700">
            <Textarea
              value={data[field.id] || ""} // Handle null value
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={!isEditing} // Disable if not editing
            />
          </AccordionContent>
        </AccordionItem>
      ))}
      
    </Accordion>
  );
};
