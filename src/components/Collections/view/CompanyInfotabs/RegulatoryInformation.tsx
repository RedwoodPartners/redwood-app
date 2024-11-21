"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { Client, Databases, Query } from "appwrite";

import { EditIcon, SaveIcon } from "lucide-react";


type RegulatoryData = {
  dpiitNumber: string;
  cinNumber: string;
  tanNumber: string;
  panNumber: string;
};

export const REGULATORY_COLLECTION_ID = "6731872d0023e52aebc3";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);

interface RegulatoryInformationProps {
  startupId: string; 
}

const RegulatoryInformation: React.FC<RegulatoryInformationProps> = ({ startupId }) => {
  const [regulatoryData, setRegulatoryData] = useState<RegulatoryData>({
    dpiitNumber: "",
    cinNumber: "",
    tanNumber: "",
    panNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          REGULATORY_COLLECTION_ID,
          [Query.equal("startupId", startupId)]
        );
  
        if (response.documents.length > 0) {
          const document = response.documents[0];
          setRegulatoryData({
            dpiitNumber: document.dpiitNumber || "",
            cinNumber: document.cinNumber || "",
            tanNumber: document.tanNumber || "",
            panNumber: document.panNumber || "",
          });
          setDocumentId(document.$id); 
        } else {
          setRegulatoryData({
            dpiitNumber: "",
            cinNumber: "",
            tanNumber: "",
            panNumber: "",
          });
        }
      } catch (error) {
        console.error("Error fetching regulatory data:", error);
      }
    };
  
    if (startupId) {
      fetchData();
    }
  }, [startupId]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof RegulatoryData
  ) => {
    setRegulatoryData({
      ...regulatoryData,
      [field]: e.target.value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Save data to Appwrite
  const handleSave = async () => {
    try {
      const { dpiitNumber, cinNumber, tanNumber, panNumber } = regulatoryData;
  
      if (documentId) {
        await databases.updateDocument(DATABASE_ID, REGULATORY_COLLECTION_ID, documentId, {
          dpiitNumber,
          cinNumber,
          tanNumber,
          panNumber,
        });
      } else {

        const response = await databases.createDocument(DATABASE_ID, REGULATORY_COLLECTION_ID, "unique()", {
          dpiitNumber,
          cinNumber,
          tanNumber,
          panNumber,
          startupId: startupId,
        });
        setDocumentId(response.$id);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving regulatory data:", error);
    }
  };


  return (
    <>
      <div className="flex items-center">
        <h2 className="container text-lg font-medium mb-2 -mt-4">Regulatory Information</h2>
        <EditIcon size={25} className="-mt-6 cursor-pointer" onClick={handleEdit} />
        {isEditing && (
          <div onClick={handleSave} className="-mt-6 ml-5 cursor-pointer">
            <SaveIcon size={25} />
          </div>
        )}
      </div>
      
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            ["DPIIT Number", "dpiitNumber"],
            ["CIN Number", "cinNumber"],
            ["TAN Number", "tanNumber"],
            ["PAN Number", "panNumber"],
          ].map(([label, field]) => (
            <div key={label} className="flex flex-col">
              <Label className="font-semibold text-gray-700 mb-1">{label}</Label>
              <Input
                type="text"
                value={regulatoryData[field as keyof RegulatoryData]}
                onChange={(e) => handleInputChange(e, field as keyof RegulatoryData)}
                disabled={!isEditing}
                className="border border-gray-300 rounded px-2 py-1 text-gray-600"
                placeholder={`Enter ${label}`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RegulatoryInformation;