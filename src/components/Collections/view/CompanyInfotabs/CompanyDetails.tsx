"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { databases, useIsStartupRoute } from "@/lib/utils";
import { PROJECTS_ID, STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactSelect from "react-select";
import Link from "next/link";
import { Query } from "appwrite";


interface StartupData {
  [key: string]: string | string[];
  brandName: string;
  dateOfIncorporation: string;
  companyStage: string;
  businessType: string;
  businessModel: string[];
  patentsCertifications: string;
  registeredState: string;
  registeredCompanyName: string;
  domain: string;
  incubated: string;
  revenue: string;
  natureOfCompany: string;
  registeredCountry: string;
  subDomain: string;
  communityCertificate: string;
  employees: string;
}

interface CompanyDetailsProps {
  startupId: string | undefined;
}
export const HISTORY_COLLECTON_ID = "67c82d7b000b564ff2e4";

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const { toast } = useToast();
  const isStartupRoute = useIsStartupRoute();

  const [receivedDate, setReceivedDate] = useState<string | null>(null);


  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(STAGING_DATABASE_ID, STARTUP_ID, startupId);
          const parsedData = {
            brandName: data.brandName,
            businessType: data.businessType,
            companyStage: data.companyStage,
            registeredCountry: data.registeredCountry,
            registeredCompanyName: data.registeredCompanyName,
            dateOfIncorporation: data.dateOfIncorporation,
            patentsCertifications: data.patentsCertifications,
            registeredState: data.registeredState,
            natureOfCompany: data.natureOfCompany,
            domain: data.domain,
            incubated: data.incubated,
            revenue: data.revenue,
            businessModel: data.businessModel,
            subDomain: data.subDomain,
            communityCertificate: data.communityCertificate,
            employees: data.employees,
          };
          setStartupData(parsedData);
          setUpdatedData(parsedData);

          // fetch receivedDate to restrict dateOfIncorporation input date
          const projectResponse = await databases.listDocuments(
            STAGING_DATABASE_ID,
            PROJECTS_ID,
            [Query.equal("startupId", startupId)] 
          );

          if (projectResponse.documents.length > 0) {
            const projectData = projectResponse.documents[0]; 
            setReceivedDate(projectData.receivedDate);
          } else {
            console.error("No matching document found in PROJECTS_ID collection.");
          }
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
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      const changes = [];
      for (const key in updatedData) {
        if (updatedData[key] !== startupData?.[key]) {
          let oldValue = startupData?.[key] || "N/A";
          let newValue = updatedData[key];
  
          // Convert arrays to comma-separated strings for Appwrite compatibility
          if (Array.isArray(oldValue)) {
            oldValue = oldValue.join(", ");
          }
          if (Array.isArray(newValue)) {
            newValue = newValue.join(", ");
          }
  
          // Ensure values are strings and truncate to 100 characters if necessary
          oldValue = String(oldValue).slice(0, 100);
          newValue = String(newValue).slice(0, 100);
  
          changes.push({
            startupId,
            fieldChanged: key,
            oldValue,
            newValue,
            changedAt: new Date().toISOString(),
          });
        }
      }
  
      // Save changes to the StartupHistory collection
      await Promise.all(
        changes.map((change) =>
          databases.createDocument(STAGING_DATABASE_ID, HISTORY_COLLECTON_ID, "unique()", change)
        )
      );
  
      // Update the startup details
      await databases.updateDocument(STAGING_DATABASE_ID, STARTUP_ID, startupId, updatedData);
      setStartupData(updatedData);
      setIsEditing(false);
      toast({ title: "Company Details saved!" });
    } catch (error) {
      console.error("Error saving updated data:", error);
      setError("Failed to save changes. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const handleChange = (key: keyof StartupData, value: any) => {
    if (updatedData) {
      let newValue = value;
      if (key === "subDomain" || key === "registeredState" || key === "registeredCountry") {
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
      "PvtLtd",
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
  
  const BusinessModelSelect = ({
    value,
    disabled,
    onChange,
  }: {
    value: string[];
    disabled: boolean;
    onChange: (value: string[]) => void;
  }) => {
    const options = [
      { value: "B2B", label: "B2B" },
      { value: "B2B2C", label: "B2B2C" },
      { value: "B2G", label: "B2G" },
      { value: "B2C", label: "B2C" },
      { value: "D2C", label: "D2C" },
    ];
  
    return (
      <ReactSelect
        isMulti
        isDisabled={disabled}
        options={options}
        value={options.filter((option) => value.includes(option.value))} // Map selected values to options
        onChange={(selectedOptions) =>
          onChange(selectedOptions.map((option) => option.value))
        }
        className="basic-multi-select"
        classNamePrefix="select"
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isDisabled ? "white" : provided.backgroundColor,
            cursor: state.isDisabled ? "not-allowed" : "default",
            opacity: state.isDisabled ? 1 : 1,
          }),
        }}
      />
    );
  };
  

  const renderDropdown = (key: keyof StartupData) =>
    key === "domain" ? (
      renderDomainDropdown()
    ) : (
      <Select
        disabled={!isEditing}
        onValueChange={(value) => handleChange(key, value)}
        value={typeof updatedData?.[key] === "string" ? updatedData[key] : ""}
      >
        <SelectTrigger className="py-2 border rounded-md text-sm">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {dropdownOptions[key]?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

  // Render dropdown with search functionality for domain
  const renderDomainDropdown = () => {
    const filteredDomains =
      dropdownOptions.domain?.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

    return (
      <Select
        disabled={!isEditing}
        onValueChange={(value) => handleChange("domain", value)}
        value={updatedData?.domain || ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Domain" />
        </SelectTrigger>
        <SelectContent className="">
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md py-1 px-2"
            />
          </div>
          {filteredDomains.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          {filteredDomains.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No results found</div>
          )}
        </SelectContent>
      </Select>
    );
  };

  const validateCharacterInput = (value: string) => {
    return value.replace(/[^a-zA-Z\s]/g, '');
  };
  
  const fieldLabels: { [key in keyof StartupData]: string } = {
    brandName: "Brand Name",
    dateOfIncorporation: "Date of Incorporation",
    companyStage: "Company Stage",
    businessType: "Business Type",
    businessModel: "Business Model",
    patentsCertifications: "Patents & Certifications",
    registeredCompanyName: "Registered Company Name",
    registeredState: "Registered State",
    domain: "Domain",
    incubated: "Incubated",
    revenue: "Revenue (last FY)",
    natureOfCompany: "Nature of Company",
    registeredCountry: "Registered Country",
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
        <div className="flex space-x-4 items-center">
        <h2 className="text-lg font-medium">Company Details</h2>
        {isStartupRoute && (
            <Link href={`/startup/${startupId}/StartupHistory`}>
              <span className="text-blue-500 hover:text-blue-700 text-sm">
                Audit Trails
              </span>
            </Link>
          )}
        </div>
        {isEditing ? (
          <div onClick={handleSaveClick} className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1">
            <SaveIcon
              size={15}
              className="text-green-500"
              aria-disabled={isSubmitting}
            />
            <span className="text-xs">
              {isSubmitting ? "Saving..." : "Save"}
            </span>
          </div>
        ) : (
          <div className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1" onClick={handleEditClick}>
            <EditIcon size={15} />
            <span className="text-xs">Edit</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4 bg-white mx-auto p-3 rounded-lg border border-gray-300">
        {Object.entries(startupData).map(([key, value]) => (
          <div key={key} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label className="font-semibold text-gray-700">
                {fieldLabels[key as keyof StartupData] || key}
              </Label>
              {key === "businessModel" ? (
                <BusinessModelSelect
                value={updatedData?.businessModel || []} // Pass selected values as an array
                disabled={!isEditing}
                onChange={(value) => handleChange("businessModel", value)}
              />
              ) : key === "dateOfIncorporation" ? (
                <Input
                  type="date"
                  className="text-black"
                  disabled={!isEditing}
                  value={updatedData?.[key as keyof StartupData] || ""}
                  max={receivedDate ? new Date(receivedDate).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange(key as keyof StartupData, e.target.value)}
                />
              ) : key === "revenue" ? (
                <Input
                  type="text"
                  className="text-black"
                  placeholder="0 INR"
                  disabled={!isEditing}
                  value={`₹${updatedData?.[key as keyof StartupData] || "0"}`}
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
                    if ((key === 'subDomain' || key === 'registeredState' || key === 'registeredCountry') && !/[a-zA-Z\s]/.test(e.key)) {
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
