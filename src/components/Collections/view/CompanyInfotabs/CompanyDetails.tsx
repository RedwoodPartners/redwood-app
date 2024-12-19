"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EditIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Client, Databases } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

interface StartupData {
  brandName: string;
  dateOfIncorporation: string;
  companyStage: string;
  businessType: string;
  registeredCompanyName: string;
  registeredCountry: string;
  natureOfCompany: string;
  registeredState: string;
  domain: string;
  subDomain: string;
  incubated: string;
  communityCertificate: string;
  patentsCertifications: string;
  revenue: string;
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
            registeredCompanyName: data.registeredCompanyName,
            registeredCountry: data.registeredCountry,
            natureOfCompany: data.natureOfCompany,
            registeredState: data.registeredState,
            domain: data.domain,
            subDomain: data.subDomain,
            incubated: data.incubated,
            communityCertificate: data.communityCertificate,
            patentsCertifications: data.patentsCertifications,
            revenue: data.revenue,
            employees: data.employees,
          };
          setStartupData(parsedData);
          setUpdatedData(parsedData);
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
        }
      }
    };

    fetchStartupDetails();
  }, [startupId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!updatedData || !startupId) return;

    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    try {
      await databases.updateDocument(DATABASE_ID, STARTUP_ID, startupId, updatedData);
      setStartupData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving updated data:", error);
      setError("Failed to save changes. Please try again later.");
    }
  };

  const handleChange = (key: keyof StartupData, value: string) => {
    if (updatedData) {
      setUpdatedData({ ...updatedData, [key]: value });
    }
  };

  const dropdownOptions: { [key: string]: string[] } = {
    companyStage: [
      "Pre First Connect",
      "First Connect",
      "SME",
      "Deep Dive",
      "PSC",
      "IC"
    ],
    businessType: [
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
      "Pvt Ltd",
      "LLP",
      "Partnership",
      "Proprietorship",
      "One Person Company",
      "Entity Not Incorporated",
    ],
    domain: [
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
  };

  const renderDropdown = (key: keyof StartupData) => (
    <select
      disabled={!isEditing}
      value={updatedData?.[key] || ""}
      onChange={(e) => handleChange(key, e.target.value)}
      className="py-2 border rounded-md text-sm"
    >
      <option value="">Select</option>
      {dropdownOptions[key]?.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const fieldLabels: { [key in keyof StartupData]: string } = {
    brandName: "Brand Name",
    dateOfIncorporation: "Date of Incorporation",
    companyStage: "Company Stage",
    businessType: "Business Type",
    registeredCompanyName: "Registered Company Name",
    registeredCountry: "Registered Country",
    natureOfCompany: "Nature of Company",
    registeredState: "Registered State",
    domain: "Domain",
    subDomain: "Sub-Domain",
    incubated: "Incubated",
    communityCertificate: "Community Certificate",
    patentsCertifications: "Patents & Certifications",
    revenue: "Revenue",
    employees: "Number of Employees",
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
        {isEditing ? (
          <SaveIcon
            size={25}
            className="cursor-pointer"
            onClick={() => {
              handleSaveClick();
              toast({ title: "Company Details saved!!" });
            }}
          />
        ) : (
          <EditIcon size={25} className="cursor-pointer" onClick={handleEditClick} />
        )}
      </div>

      <div className="grid grid-cols-5 gap-4 mt-2 bg-white mx-auto p-3 rounded-lg shadow-lg border border-gray-300">
        {Object.entries(startupData).map(([key, value]) => (
          <div key={key} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label className="font-semibold text-gray-700">
                {fieldLabels[key as keyof StartupData] || key}
              </Label>
              {["companyStage", "businessType", "natureOfCompany", "domain"].includes(key) ? (
                renderDropdown(key as keyof StartupData)
              ) : (
                <Input
                  className="text-black"
                  disabled={!isEditing}
                  value={updatedData?.[key as keyof StartupData] || ""}
                  onChange={(e) => handleChange(key as keyof StartupData, e.target.value)}
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
