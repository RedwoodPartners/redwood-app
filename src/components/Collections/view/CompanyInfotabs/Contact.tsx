"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { STAGING_DATABASE_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import { Query } from "appwrite";
import { EditIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ContactData = {
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

interface ContactInformationProps {
  startupId: string;
}

const ContactInformation: React.FC<ContactInformationProps> = ({ startupId }) => {
  const [contactData, setContactData] = useState<ContactData>({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone1Error, setPhone1Error] = useState<string | null>(null);
  const [phone2Error, setPhone2Error] = useState<string | null>(null);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          CONTACT_ID,
          [Query.equal("startupId", startupId)]
        );
        if (response.documents.length > 0) {
          const document = response.documents[0];
          setContactData({
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
          const isSame = 
          document.address1 === document.address21 &&
          document.address2 === document.address22 &&
          document.city === document.city2 &&
          document.state === document.state2 &&
          document.postalCode === document.postalCode2;
        setIsSameAddress(isSame);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };

    if (startupId) {
      fetchData();
    }
  }, [startupId]);

  const validateWebsite = (url: string) => {
    if (url === "") {
      setWebsiteError(null);
      return true;
    }
    try {
      new URL(url);
      setWebsiteError(null);
      return true;
    } catch (error) {
      setWebsiteError("Enter a valid website URL.");
      return false;
    }
  };
  
  const validateEmail = (email: string) => {
    if (email === "") {
      setEmailError(null);
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setEmailError(null);
      return true;
    }
    setEmailError("Enter a valid email address.");
    return false;
  };
  
  const validatePhoneNumber = (phone: string) => {
    if (phone === "") {
      return true;
    }
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePostalCode = (code: string) => {
    if (code === "") {
      setPostalCodeError(null);
      return true;
    }
    const postalCodeRegex = /^\d{6}$/;
    if (postalCodeRegex.test(code)) {
      setPostalCodeError(null);
      return true;
    }
    setPostalCodeError("Enter a valid 6-digit postal code.");
    return false;
  };
  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ContactData
  ) => {
    const value = e.target.value;
    if (field === "companyWebsite") {
      validateWebsite(value);
    } else if (field === "email") {
      validateEmail(value);
    } else if (field === "phone1" || field === "phone2") {
      if (value === "" || validatePhoneNumber(value)) {
        field === "phone1" ? setPhone1Error(null) : setPhone2Error(null);
      } else {
        const errorMessage = "Enter a valid 10-digit phone number.";
        field === "phone1" ? setPhone1Error(errorMessage) : setPhone2Error(errorMessage);
      }
    } else if (field === "postalCode" || field === "postalCode2") {
      validatePostalCode(value);
    }
    setContactData({ ...contactData, [field]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSameAddress(checked);
    if (checked) {
      setContactData((prevData) => ({
        ...prevData,
        address21: prevData.address1,
        address22: prevData.address2,
        city2: prevData.city,
        state2: prevData.state,
        postalCode2: prevData.postalCode,
      }));
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let hasErrors = false;
  
      if (contactData.companyWebsite && !validateWebsite(contactData.companyWebsite)) {
        hasErrors = true;
      }
      if (contactData.email && !validateEmail(contactData.email)) {
        hasErrors = true;
      }
      if (contactData.phone1 && !validatePhoneNumber(contactData.phone1)) {
        setPhone1Error("Enter a valid 10-digit phone number.");
        hasErrors = true;
      }
      if (contactData.phone2 && !validatePhoneNumber(contactData.phone2)) {
        setPhone2Error("Enter a valid 10-digit phone number.");
        hasErrors = true;
      }
      if (contactData.postalCode && !validatePostalCode(contactData.postalCode)) {
        hasErrors = true;
      }
      if (contactData.postalCode2 && !validatePostalCode(contactData.postalCode2)) {
        hasErrors = true;
      }
  
      if (hasErrors) {
        toast({
          title: "Please correct the errors before saving.",
          variant: "destructive",
        });
        return;
      }
  
      // saving the data
      if (documentId) {
        await databases.updateDocument(STAGING_DATABASE_ID, CONTACT_ID, documentId, contactData);
      } else {
        const response = await databases.createDocument(
          STAGING_DATABASE_ID,
          CONTACT_ID,
          "unique()",
          { ...contactData, startupId }
        );
        setDocumentId(response.$id);
      }
  
      setIsEditing(false);
      toast({
        title: "Contact Information saved!",
      });
    } catch (error) {
      console.error("Error saving contact data:", error);
      toast({
        title: "Error saving contact information",
        variant: "destructive",
      });
    }finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <>
      <div className="flex items-center">
        <h2 className="container text-lg font-medium mb-2">Contact</h2>
        <div className="relative group ">
          <EditIcon size={25} className="cursor-pointer" onClick={handleEdit} />
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
            Edit
          </span>
        </div>
        {isEditing && (
          <div className="ml-5 cursor-pointer">
            <div className="relative group">
              <SaveIcon size={25} className="cursor-pointer text-green-500" onClick={handleSave} aria-disabled={isSubmitting} />
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                {isSubmitting ? "Saving..." : "Save"}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-8 border border-gray-150 p-4 rounded-md shadow-sm bg-white">
      <div>
        <div className="flex flex-row space-x-4 w-full">
          <div className="w-full">
            <Label className="font-semibold text-gray-700">Company Website</Label>
            <Input
              disabled={!isEditing}
              autoComplete="off"
              value={contactData.companyWebsite}
              onChange={(e) => handleInputChange(e, "companyWebsite")}
              className={websiteError ? "border-red-500" : ""}
            />
            {websiteError && <p className="text-red-500 text-sm mt-1">{websiteError}</p>}
          </div>
          <div className="w-full">
            <Label className="font-semibold text-gray-700">Email</Label>
            <Input
              disabled={!isEditing}
              autoComplete="off"
              value={contactData.email}
              onChange={(e) => handleInputChange(e, "email")}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div className="w-full">
            <Label className="font-semibold text-gray-700">Primary Phone Number</Label>
            <Input
              type="number"
              disabled={!isEditing}
              value={contactData.phone1}
              onChange={(e) => handleInputChange(e, "phone1")}
              className={phone1Error ? "border-red-500" : ""}
            />
            {phone1Error && <p className="text-red-500 text-sm mt-1">{phone1Error}</p>}
          </div>
          <div className="w-full">
            <Label className="font-semibold text-gray-700">Secondary Phone Number</Label>
            <Input
              type="number"
              disabled={!isEditing}
              value={contactData.phone2}
              onChange={(e) => handleInputChange(e, "phone2")}
              className={phone2Error ? "border-red-500" : ""}
            />
            {phone2Error && <p className="text-red-500 text-sm mt-1">{phone2Error}</p>}
          </div>
        </div>
      </div>
      <div>
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
                  value={contactData[field as keyof ContactData]}
                  onChange={(e) => handleInputChange(e, field as keyof ContactData)}
                  className={field === "postalCode" && postalCodeError ? "border-red-500" : ""}
                />
                {field === "postalCode" && postalCodeError && (
                  <p className="text-red-500 text-sm mt-1">{postalCodeError}</p>
                )}
                
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
      <div>
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
                  value={contactData[field as keyof ContactData]}
                  onChange={(e) => handleInputChange(e, field as keyof ContactData)}
                  className={field === "postalCode2" && postalCodeError ? "border-red-500" : ""}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactInformation;
