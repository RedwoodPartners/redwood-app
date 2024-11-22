"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { EditIcon, SaveIcon } from "lucide-react";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";

export const SHAREHOLDERS_ID = "6735cb6f001a18acd88f";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

interface ShareholdersProps {
  startupId: string;
}

const ShareholderPage: React.FC<ShareholdersProps> = ({ startupId }) => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          SHAREHOLDERS_ID,
          [Query.equal("startupId", startupId)]
        );
        if (response.documents.length > 0) {
          setData(response.documents[0]);
          setDocumentId(response.documents[0].$id);
        } else {
          setData({});
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
  };

  const handleSave = async () => {
    try {
      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = data;

      if (documentId) {
        await databases.updateDocument(DATABASE_ID, SHAREHOLDERS_ID, documentId, dataToUpdate);
      } else {
        const response = await databases.createDocument(
          DATABASE_ID,
          SHAREHOLDERS_ID,
          "unique()",
          { startupId, ...dataToUpdate }
        );
        setDocumentId(response.$id);
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
        <h2 className="container text-lg font-medium mb-2 -mt-4">Shareholders</h2>
        <EditIcon size={25} className="cursor-pointer" onClick={handleEdit} />
        {isEditing && (
          <div onClick={handleSave} className="ml-5 cursor-pointer">
            <SaveIcon size={25} />
          </div>
        )}
      </div>
    <div className="p-3 bg-white shadow-md rounded-lg border border-gray-300">
      <form>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Shareholder Name</Label>
            <Input
              id="shareholderName"
              type="text"
              placeholder="Shareholder Name"
              value={data["shareholderName"] || ""}
              onChange={(e) => handleChange("shareholderName", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Is Community Certificate Holder?</Label>
            <Input
              id="isCommunityHolder"
              type="text"
              placeholder="yes/no"
              value={data["isCommunityHolder"] || ""}
              onChange={(e) => handleChange("isCommunityHolder", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Gender</Label>
            <Input
              id="gender"
              type="text"
              placeholder="Gender"
              value={data["gender"] || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>LinkedIn Profile</Label>
            <Input
              id="linkedinProfile"
              type="url"
              placeholder="url:"
              value={data["linkedinProfile"] || ""}
              onChange={(e) => handleChange("linkedinProfile", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <Label>Is Partner/Director?</Label>
            <Input
              id="isPartner"
              type="text"
              placeholder="is Partner/Director"
              value={data["isPartner"] || ""}
              onChange={(e) => handleChange("isPartner", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Director Identification Number</Label>
            <Input
              id="directorId"
              type="text"
              placeholder="Identification Number"
              value={data["directorId"] || ""}
              onChange={(e) => handleChange("directorId", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone"
              value={data["phone"] || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={data["email"] || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </form>

      {/* Accordion Section */}
      <AccordionDemo
        data={data}
        isEditing={isEditing}
        onChange={handleChange}
      />
    </div>
    </div>
  );
};

// Accordion Component for Additional Details
const AccordionDemo: React.FC<{
  data: { [key: string]: string | null };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}> = ({ data, isEditing, onChange }) => {
  const fields = [
    { id: "educationalQualification", label: "Educational Qualification" },
    { id: "workExperience", label: "Work Experience" },
    { id: "associatedCompanies", label: "Associated Companies" },
  ];

  return (
    <div className="mt-4 p-2">
      <h3 className="text-lg font-semibold mb-2">About Shareholder</h3>
      <Accordion type="single" collapsible>
        {fields.map((field) => (
          <AccordionItem
            key={field.id}
            value={field.id}
            className="px-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-100"
          >
            <AccordionTrigger className="text-sm font-semibold">{field.label}</AccordionTrigger>
            <AccordionContent className="mt-2 text-gray-700">
              <Textarea
                value={data[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
                disabled={!isEditing}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ShareholderPage;
