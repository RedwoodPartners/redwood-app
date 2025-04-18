"use client";
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID } from "@/appwrite/config";
import { databases, useIsStartupRoute } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export const ABOUT_COLLECTION_ID = "67207029001de651f13d";
export const ABOUT_BUSINESS_HISTORY_COLLECTION_ID = "67cd3c3200358b51bdc9";

interface AboutBusinessProps {
  startupId: string;
}

const AboutBusiness: React.FC<AboutBusinessProps> = ({ startupId }) => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<{ [key: string]: string | null }>({});
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [changes, setChanges] = useState<{ fieldChanged: string; oldValue: string; newValue: string }[]>([]);
  const isStartupRoute = useIsStartupRoute();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          ABOUT_COLLECTION_ID,
          [Query.equal("startupId", startupId)]
        );

        if (response.documents.length > 0) {
          setData(response.documents[0]);
          setOriginalData(response.documents[0]);
          setDocumentId(response.documents[0].$id);
        } else {
          setData({});
          setOriginalData({});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (startupId) {
      fetchData();
    }
  }, [startupId]);

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalData(data);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { $id, $databaseId, $collectionId, ...userDefinedData } = data;

      if (documentId) {
        await databases.updateDocument(STAGING_DATABASE_ID, ABOUT_COLLECTION_ID, documentId, userDefinedData);
      } else {
        const response = await databases.createDocument(STAGING_DATABASE_ID, ABOUT_COLLECTION_ID, "unique()", {
          ...userDefinedData,
          startupId: startupId,
        });
        setDocumentId(response.$id);
      }

      const historyChanges = changes.map((change) => ({
        startupId,
        fieldChanged: change.fieldChanged,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changedAt: new Date().toISOString(),
      }));

      await Promise.all(
        historyChanges.map((change) =>
          databases.createDocument(STAGING_DATABASE_ID, ABOUT_BUSINESS_HISTORY_COLLECTION_ID, "unique()", change)
        )
      );

      setOriginalData(data);
      setIsEditing(false);
      toast({ title: "About Business saved!" });
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setData(originalData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setData((prevData) => ({ ...prevData, [field]: value }));

    if (originalData[field] !== value) {
      const change = {
        fieldChanged: field,
        oldValue: originalData[field] || "N/A",
        newValue: value,
      };

      setChanges((prevChanges) => {
        const existingChangeIndex = prevChanges.findIndex((c) => c.fieldChanged === field);
        if (existingChangeIndex !== -1) {
          const updated = [...prevChanges];
          updated[existingChangeIndex] = change;
          return updated;
        } else {
          return [...prevChanges, change];
        }
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium">About Business</h2>
          {isStartupRoute && (
            <Link href={`/startup/${startupId}/AboutBusinessHistory`}>
              <span className="text-blue-500 hover:text-blue-700 text-sm">Audit Trails</span>
            </Link>
          )}
        </div>

        {isEditing ? (
          <div className="flex space-x-1 cursor-pointer">
            <div
              onClick={handleSave}
              className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1"
            >
              <SaveIcon size={15} className="text-green-500" aria-disabled={isSubmitting} />
              <span className="text-xs">{isSubmitting ? "Saving..." : "Save"}</span>
            </div>
            <div
              onClick={handleCancel}
              className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1"
            >
              <XIcon size={15} className="text-red-500" />
              <span className="text-xs">Cancel</span>
            </div>
          </div>
        ) : (
          <div
            onClick={handleEdit}
            className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1"
          >
            <EditIcon size={15} />
            <span className="text-xs">Edit</span>
          </div>
        )}
      </div>

      <AccordionDemo data={data} isEditing={isEditing} onChange={handleChange} />
    </div>
  );
};

export default AboutBusiness;

interface AccordionDemoProps {
  data: { [key: string]: string | null };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

const AccordionDemo: React.FC<AccordionDemoProps> = ({ data, isEditing, onChange }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);

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
    <Accordion
      type="single"
      collapsible
      value={openItem ?? undefined}
      onValueChange={(value) => setOpenItem(value)}
    >
      {fields.map((field) => (
        <AccordionItem
          key={field.id}
          value={field.id}
          className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <AccordionTrigger className="text-sm font-semibold">
            {field.label}
          </AccordionTrigger>
          <AccordionContent>
            <ReactQuill
              key={`${field.id}-${isEditing}-${openItem === field.id}`} // forces rerender
              theme={isEditing ? "snow" : "bubble"}
              value={data[field.id] || ""}
              onChange={(value) => onChange(field.id, value)}
              readOnly={!isEditing}
              className="h-96"
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
