"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { Client, Databases, Query } from "appwrite";

import { EditIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RegulatoryData = {
  companyWebsite: string;
  email: string;
  phone1: string;
  phone2: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  address21: string;
  address22: string;
  city2: string;
  state2: string;
  postalCode2: string;
};

export const CONTACT_ID = "672bac4a0017528d75ae";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);

interface RegulatoryInformationProps {
  startupId: string;
}

const RegulatoryInformation: React.FC<RegulatoryInformationProps> = ({ startupId }) => {
  const [regulatoryData, setRegulatoryData] = useState<RegulatoryData>({
    companyWebsite: "",
    email: "",
    phone1: "",
    phone2: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    address21: "",
    address22: "",
    city2: "",
    state2: "",
    postalCode2: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isSameAddress, setIsSameAddress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          CONTACT_ID,
          [Query.equal("startupId", startupId)]
        );
  
        if (response.documents.length > 0) {
          const document = response.documents[0];
          setRegulatoryData({
            companyWebsite: document.companyWebsite || "",
            email: document.email || "",
            phone1: document.phone1 || "",
            phone2: document.phone2 || "",
            address1: document.address1 || "",
            address2: document.address2 || "",
            city: document.city || "",
            state: document.state || "",
            postalCode: document.postalCode || "",
            address21: document.address21 || "",
            address22: document.address22 || "",
            city2: document.city2 || "",
            state2: document.state2 || "",
            postalCode2: document.postalCode2 || "",
          });
          setDocumentId(document.$id);
        } else {
          setRegulatoryData({
            companyWebsite: "",
            email: "",
            phone1: "",
            phone2: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            postalCode: "",
            address21: "",
            address22: "",
            city2: "",
            state2: "",
            postalCode2: "",
          });
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };
  
    if (startupId) {
      fetchData();
    }
  }, [startupId]);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSameAddress(checked);

    if (checked) {
      setRegulatoryData((prevData) => ({
        ...prevData,
        address21: prevData.address1,
        address22: prevData.address2,
        city2: prevData.city,
        state2: prevData.state,
        postalCode2: prevData.postalCode,
      }));
    }
  };

  // Save data to Appwrite
  const handleSave = async () => {
    try {
      const { companyWebsite, email, phone1, phone2, address1, address2, city, state, postalCode, address21, address22, city2, state2, postalCode2 } = regulatoryData;
  
      if (documentId) {
        await databases.updateDocument(DATABASE_ID, CONTACT_ID, documentId, {
          companyWebsite,
          email,
          phone1,
          phone2,
          address1,
          address2,
          city,
          state,
          postalCode,
          address21,
          address22,
          city2,
          state2,
          postalCode2,
        });
      } else {
        const response = await databases.createDocument(DATABASE_ID, CONTACT_ID, "unique()", {
          companyWebsite,
          email,
          phone1,
          phone2,
          address1,
          address2,
          city,
          state,
          postalCode,
          address21,
          address22,
          city2,
          state2,
          postalCode2,

          startupId: startupId,
        });
        setDocumentId(response.$id);
      }
      setIsEditing(false);
      toast({
        title: "Contact Information saved!",
      });
    } catch (error) {
      console.error("Error saving regulatory data:", error);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h2 className="container text-lg font-medium mb-2 -mt-4">Contact</h2>
        <EditIcon size={25} className="-mt-6 cursor-pointer" onClick={handleEdit} />
        {isEditing && (
          <div onClick={handleSave} className="-mt-6 ml-5 cursor-pointer">
            <SaveIcon size={25} className="cursor-pointer" />
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-4 border border-gray-150 p-4 rounded-md shadow-sm">
        <div className="flex flex-row space-x-4 w-full">
          {[
            ["Company website", "companyWebsite"],
            ["Email", "email"],
            ["Primary Phone Number", "phone1"],
            ["Secondary Phone Number", "phone2"],
          ].map(([label, field]) => (
            <div key={field} className="w-full">
              <Label className="font-semibold text-gray-700">{label}</Label>
              <Input
                disabled={!isEditing}
                value={regulatoryData[field as keyof RegulatoryData]}
                onChange={(e) => handleInputChange(e, field as keyof RegulatoryData)}
              />
            </div>
          ))}
        </div>
      </div>
      

      {/* Registered Address Section */}
      <div className="flex flex-col space-y-4 mt-5 border border-gray-150 p-4 rounded-md shadow-sm">
        <h3 className="font-bold text-sm">Registered Address</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-row space-x-5">
            {[
              ["Address Line 1", "address1"],
              ["Address Line 2", "address2"],
              ["City", "city"],
              ["State", "state"],
              ["Postal Code", "postalCode"],
            ].map(([label, field]) => (
              <div key={field} className="w-full">
                <Label className="font-semibold text-gray-700">{label}</Label>
                <Input
                  disabled={!isEditing}
                  value={regulatoryData[field as keyof RegulatoryData]}
                  onChange={(e) => handleInputChange(e, field as keyof RegulatoryData)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            id="sameAddress"
            disabled={!isEditing}
            checked={isSameAddress}
            onChange={handleCheckboxChange}
          />
          <Label htmlFor="sameAddress" className="font-semibold text-gray-700">
            Is Communication Address the same as Registered Address?
          </Label>
        </div>

      {/* Communication Address Section */}
      <div className="flex flex-col space-y-4 mt-5 border border-gray-150 p-4 rounded-md shadow-sm">
        <h3 className="font-bold text-sm">Communication Address</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-row space-x-5">
            {[
              ["Address Line 1", "address21"],
              ["Address Line 2", "address22"],
              ["City", "city2"],
              ["State", "state2"],
              ["Postal Code", "postalCode2"],
            ].map(([label, field]) => (
              <div key={field} className="w-full">
                <Label className="font-semibold text-gray-700">{label}</Label>
                <Input
                  disabled={!isEditing}
                  value={regulatoryData[field as keyof RegulatoryData]}
                  onChange={(e) => handleInputChange(e, field as keyof RegulatoryData)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RegulatoryInformation;
