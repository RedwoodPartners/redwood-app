"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StartupData {
  brandName: string;
  dateOfIncorporation: string;
  companyStage: string;
  businessType: string;
  patentsCertifications: string;
  registeredCompanyName: string;
  registeredCountry: string;
  domain: string;
  incubated: string;
  revenue: string;
  natureOfCompany: string;
  registeredState: string;
  subDomain: string;
  communityCertificate: string;
  employees: string;
}

interface CompanyDetailsProps {
  startupId: string | undefined;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
          const parsedData = {
            brandName: data.brandName,
            dateOfIncorporation: data.dateOfIncorporation,
            companyStage: data.companyStage,
            businessType: data.businessType,
            patentsCertifications: data.patentsCertifications,
            registeredCompanyName: data.registeredCompanyName,
            registeredCountry: data.registeredCountry,
            domain: data.domain,
            incubated: data.incubated,
            revenue: data.revenue,
            natureOfCompany: data.natureOfCompany,
            registeredState: data.registeredState,
            subDomain: data.subDomain,
            communityCertificate: data.communityCertificate,
            employees: data.employees,
          };
          setStartupData(parsedData);
          setUpdatedData(parsedData);
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
          setIsDialogOpen(true);
        }
      }
    };

    fetchStartupDetails();
  }, [startupId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const validateDuplicates = async (newData: StartupData) => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    
    try {
        const existingCompanies = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
        const isDuplicate = existingCompanies.documents.some(company => 
            company.brandName === newData.brandName &&
            company.businessType === newData.businessType &&
            company.natureOfCompany === newData.natureOfCompany &&
            company.domain === newData.domain
        );

        return isDuplicate;
    } catch (error) {
        console.error("Error checking for duplicates:", error);
        setError("Failed to check for duplicates. Please try again later.");
        return false;
    }
  };
  
  const ErrorPopover = ({ message }: { message: string }) => (
    <div className="absolute z-10 bg-red-600 text-white text-xs rounded-md p-2">
        {message}
    </div>
);

  const handleSaveClick = async () => {
    if (!updatedData || !startupId) return;

    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const isDuplicate = await validateDuplicates(updatedData);
        if (isDuplicate) {
            setError("A Startup with the same details already exists.");
            return;
        }

    try {
      await databases.updateDocument(DATABASE_ID, STARTUP_ID, startupId, updatedData);
      setStartupData(updatedData);
      setIsEditing(false);
      toast({ title: "Company Details saved!!" });
    } catch (error) {
      console.error("Error saving updated data:", error);
      setError("Failed to save changes. Please try again later.");
      setIsDialogOpen(true);
    }
  };

  const handleChange = (key: keyof StartupData, value: string) => {
    if (updatedData) {
      let newValue = value;
      if (key === 'subDomain' || key === 'registeredCountry' || key === 'registeredState') {
        newValue = validateCharacterInput(value);
      }
      setUpdatedData({ ...updatedData, [key]: newValue });
    }
  };
  

  const dropdownOptions: { [key: string]: string[] } = {
    companyStage: [
      "Select",
      "Ideation",
      "POC",
      "MVP",
      "Early Traction",
      "Growth",
    ],
    businessType: [
      "Select",
      "Business Model Trading",
      "Services",
      "Product Manufacturing",
      "Subcontract",
      "Product+Services",
      "Both",
      "Product",
      "Service",
    ],
    natureOfCompany: [
      "Select",
      "Pvt Ltd",
      "LLP",
      "Partnership",
      "Proprietorship",
      "One Person Company",
      "Entity Not Incorporated",
    ],
    domain: [
      "Select",
      "IOT",
      "Space Tech",
      "Sustainability",
      "Aggregator; Jewellery",
      "Tech(IT products/services)",
      "HealthTech",
      "Agriculture",
      "Proptech",
      "Drones",
      "Supply Chain",
      "Green Tech",
      "Edtech;Textile",
      "Pharma",
      "Biotech",
      "Finetech",
      "Agriculture;AgriTech",
      "Aggregator;Tech(IT products/services);Sports Tech",
      "Tribal Products",
      "Entertaiment&Media",
      "Clean Energy Technology",
      "Logistics",
      "Electronic Manufacturing Service",
      "EdTech",
      "Music",
      "HealthCare",
      "Service Provider",
      "FMCG",
      "Animal Husbandry Tech",
      "EV",
      "Manufacturing",
      "Agriculture;Electronic",
      "Manufacturing Service",
      "Aggregator",
      "Marketing Tech",
      "Water Managment",
      "Clothing",
      "Service Provider;Cleantech",
      "Healthcare;Naturopathy",
      "Renewable Energy",
      "Animal Training",
      "Textiles",
      "Automation",
      "Housing;smart home automation",
      "Biotech;Healthcare",
      "Electric and electronic service",
      "Marine tech",
      "FMCG;ESG",
      "Housing;Infrastructure;Real Estate",
      "Agritech",
      "Agritech;Animal husbandry tech;Biotech",
      "Water Management;Water Management",
      "Sanitary Napkin",
      "Artisanal Cheese;Artisanal Cheese",
      "Sanitary Napkin;Sanitary Napkin",
      "Tech (IT products/services);Drones",
      "Robotics",
      "Tech (AI)",
      "FoodTech",
      "renovation of restrooms",
      "Agritech;drones",
      "Agriculture;Tribal Products",
      "Electronic Manufacturing Service;IOT Automation",
      "ESG",
      "Tech (IT products/services);AI",
      "Waste Management",
      "Printing service",
    ],
    incubated: [
      "Yes",
      "No",
    ],
    communityCertificate: [
      "Yes",
      "No",
    ],
    patentsCertifications: [
      "Yes",
      "No",
    ],
  };

  const renderDropdown = (key: keyof StartupData) => (
    <Select
      disabled={!isEditing}
      onValueChange={(value) => handleChange(key, value)}
      value={updatedData?.[key] || ""}
    >
      <SelectTrigger className="py-2 border rounded-md text-sm">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent className="-mb-10">
        {dropdownOptions[key]?.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const validateCharacterInput = (value: string) => {
    return value.replace(/[^a-zA-Z\s]/g, '');
  };
  

  const fieldLabels: { [key in keyof StartupData]: string } = {
    brandName: "Brand Name",
    dateOfIncorporation: "Date of Incorporation",
    companyStage: "Company Stage",
    businessType: "Business Type",
    patentsCertifications: "Patents & Certifications",
    registeredCompanyName: "Registered Company Name",
    registeredCountry: "Registered Country",
    domain: "Domain",
    incubated: "Incubated",
    revenue: "Revenue (last FY)",
    natureOfCompany: "Nature of Company",
    registeredState: "Registered State",
    subDomain: "Sub-Domain",
    communityCertificate: "Community Certificate",
    employees: "Employees (last FY)",
  };

  if (!startupData) {
    return (
      <div>
        {error || (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium mb-2 -mt-4">Company Details</h2>
        {error && <div className="error-message text-red-500">{error}</div>}
        {isEditing ? (
          <div className="relative group ml-3">
            <SaveIcon
              size={25}
              className="cursor-pointer text-green-500"
              onClick={handleSaveClick}
            />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
              Save
            </span>
          </div>
        ) : (
          <div className="relative group">
            <EditIcon size={25} className="cursor-pointer" onClick={handleEditClick} />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
              Edit
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-4 mt-2 bg-white mx-auto p-3 rounded-lg shadow-lg border border-gray-300">
        {Object.entries(startupData).map(([key, value]) => (
          <div key={key} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label className="font-semibold text-gray-700">
                {fieldLabels[key as keyof StartupData] || key}
              </Label>
              
              {key === "dateOfIncorporation" ? (
                <Input
                  type="date"
                  className="text-black"
                  disabled={!isEditing}
                  value={updatedData?.[key as keyof StartupData] || ""}
                  onChange={(e) => handleChange(key as keyof StartupData, e.target.value)}
                />
              ) : key === "revenue" ? (
                <Input
                  type="text"
                  className="text-black"
                  placeholder="0 INR"
                  disabled={!isEditing}
                  value={updatedData?.[key as keyof StartupData] || ""}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9,]/g, "");
                    const formattedValue = numericValue.replace(/,/g, "");
                    const parsedValue = parseInt(formattedValue, 10);
                    const finalValue = isNaN(parsedValue) ? "0" : parsedValue.toLocaleString("en-IN");
                    handleChange(key as keyof StartupData, finalValue);
                  }}
                />
              ) : key === "employees" ? (
                <Input
                  type="number"
                  className="text-black"
                  placeholder="0"
                  disabled={!isEditing}
                  value={updatedData?.[key as keyof StartupData] || ""}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, "0");
                    handleChange(key as keyof StartupData, numericValue);
                  }}
                  min="0"
                />
              ) : ["companyStage", "businessType", "natureOfCompany", "domain", "incubated", "communityCertificate", "patentsCertifications"].includes(key) ? (
                renderDropdown(key as keyof StartupData)
              ) : (
                <Input
                  className="text-black"
                  disabled={!isEditing}
                  value={updatedData?.[key as keyof StartupData] || ""}
                  onChange={(e) => handleChange(key as keyof StartupData, e.target.value)}
                  onKeyPress={(e) => {
                    if ((key === 'subDomain' || key === 'registeredCountry' || key === 'registeredState') && !/[a-zA-Z\s]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CompanyDetails;
