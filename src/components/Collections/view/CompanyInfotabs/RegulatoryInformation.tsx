"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { Client, Databases, Query } from "appwrite";
import { EditIcon, SaveIcon, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RegulatoryData = {
  dpiitNumber: string;
  cinNumber: string;
  tanNumber: string;
  panNumber: string;
};

type ErrorData = {
  [K in keyof RegulatoryData]: string;
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
  const [errors, setErrors] = useState<ErrorData>({
    dpiitNumber: "",
    cinNumber: "",
    tanNumber: "",
    panNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { toast } = useToast();

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

  const validateInput = (value: string, format: string): boolean => {
    if (value === "") return true; // Allowing empty fields to save
    if (value.length !== format.length) return false;
    for (let i = 0; i < format.length; i++) {
      if (format[i] === 'A' && !/[A-Z]/.test(value[i])) return false;
      if (format[i] === '0' && !/[0-9]/.test(value[i])) return false;
    }
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof RegulatoryData
  ) => {
    const value = e.target.value.toUpperCase();
    setRegulatoryData({
      ...regulatoryData,
      [field]: value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({
      dpiitNumber: "",
      cinNumber: "",
      tanNumber: "",
      panNumber: "",
    });
  };

  const handleSave = async () => {
    const formats = {
      dpiitNumber: 'AAAA000000',
      cinNumber: 'A00000AA0000AAA000000',
      tanNumber: 'AAAA00000A',
      panNumber: 'AAAAA0000A',
    };

    const newErrors: ErrorData = {
      dpiitNumber: "",
      cinNumber: "",
      tanNumber: "",
      panNumber: "",
    };

    let hasErrors = false;

    Object.entries(regulatoryData).forEach(([field, value]) => {
      if (value !== "") { // Only validate non-empty fields
        const format = formats[field as keyof RegulatoryData];
        if (!validateInput(value, format)) {
          newErrors[field as keyof ErrorData] = `Please enter a valid ${field.replace('Number', '')} number`;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      toast({
        title: "Please correct the errors before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      const { dpiitNumber, cinNumber, tanNumber, panNumber } = regulatoryData;
      if (documentId) {
        await databases.updateDocument(
          DATABASE_ID,
          REGULATORY_COLLECTION_ID,
          documentId,
          {
            dpiitNumber,
            cinNumber,
            tanNumber,
            panNumber,
          }
        );
      } else {
        const response = await databases.createDocument(
          DATABASE_ID,
          REGULATORY_COLLECTION_ID,
          "unique()",
          {
            dpiitNumber,
            cinNumber,
            tanNumber,
            panNumber,
            startupId: startupId,
          }
        );
        setDocumentId(response.$id);
      }
      setIsEditing(false);
      toast({
        title: "Regulatory Information saved!",
      });
    } catch (error) {
      console.error("Error saving regulatory data:", error);
      toast({
        title: "Error saving Regulatory Information",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h2 className="container text-lg font-medium mb-2 -mt-4">Regulatory Information</h2>
        <div className="relative group ml-3">
          <EditIcon size={25} className="cursor-pointer" onClick={handleEdit} />
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
            Edit
          </span>
        </div>
        {isEditing && (
          <div onClick={handleSave} className="ml-5 cursor-pointer relative group text-green-500">
            <SaveIcon size={25} className="cursor-pointer" />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
              Save
            </span>
          </div>
        )}
      </div>
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="grid grid-cols-4 gap-4">
          {[
            ["DPIIT Number", "dpiitNumber", "AAAA000000"],
            ["CIN Number", "cinNumber", "A00000AA0000AAA000000"],
            ["TAN Number", "tanNumber", "AAAA00000A"],
            ["PAN Number", "panNumber", "AAAAA0000A"],
          ].map(([label, field, format]) => (
            <div key={label} className="flex flex-col">
              <div className="flex items-center mb-1">
                <Label className="font-semibold text-gray-700">{label}</Label>
                <div className="relative ml-2">
                  <InfoIcon size={16} className="text-gray-400" />
                  <span className={`absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 ${
                    focusedField === field ? 'block' : 'hidden'
                  } bg-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap z-10`}>
                    Format: {format}
                  </span>
                </div>
              </div>
              <Input
                type="text"
                value={regulatoryData[field as keyof RegulatoryData]}
                onChange={(e) => handleInputChange(e, field as keyof RegulatoryData)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                disabled={!isEditing}
                className={`border rounded px-2 py-1 text-black ${
                  errors[field as keyof ErrorData] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={format as string}
                maxLength={(format as string).length}
              />
              {errors[field as keyof ErrorData] && (
                <span className="text-red-500 text-xs mt-1">{errors[field as keyof ErrorData]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RegulatoryInformation;
