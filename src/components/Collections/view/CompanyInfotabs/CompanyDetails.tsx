"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { databases, useIsStartupRoute } from "@/lib/utils";
import { API_ENDPOINT, BUCKET_ID, PROJECT_ID, PROJECTS_ID, STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactSelect from "react-select";
import Link from "next/link";
import { Query } from "appwrite";
import CreatableSelect from "react-select/creatable";
import { FaEye } from "react-icons/fa";
import { DOC_CHECKLIST_ID } from "../Documentstabs/DocumentsChecklist";



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
  employees: string;
}

interface CompanyDetailsProps {
  startupId: string | undefined;
  setIsDirty: (isDirty: boolean) => void;
}
type DomainOption = {
  label: string;
  value: string;
  __isNew__?: boolean;
};

export const HISTORY_COLLECTON_ID = "67c82d7b000b564ff2e4";
const DOMAIN_COLLECTION_ID = "681e348e0037680abed9";

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ startupId, setIsDirty }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const { toast } = useToast();
  const isStartupRoute = useIsStartupRoute();

  const [receivedDate, setReceivedDate] = useState<string | null>(null);
  const [domainOptions, setDomainOptions] = useState<{ label: string; value: string }[]>([]);
  const [isDomainLoading, setIsDomainLoading] = useState(false);
  const [coiFileId, setCoiFileId] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchDomains = async () => {
      setIsDomainLoading(true);
      try {
        const res = await databases.listDocuments(STAGING_DATABASE_ID, DOMAIN_COLLECTION_ID);
        setDomainOptions(
          res.documents.map((doc: any) => ({
            label: doc.name,
            value: doc.name,
          }))
        );
      } catch (err) {
        setDomainOptions([]);
      } finally {
        setIsDomainLoading(false);
      }
    };
    fetchDomains();
  }, []);

  useEffect(() => {
    const fetchCOI = async () => {
      if (!startupId) return;
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Certificate of Incorporation"),
          ]
        );
        if (response.documents.length > 0) {
          const doc = response.documents[0];
          setCoiFileId(doc.fileId || null);
        } else {
          setCoiFileId(null);
        }
      } catch (error) {
        setCoiFileId(null);
      }
    };
    if (startupId) fetchCOI();
  }, [startupId]);


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!updatedData || !startupId) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsDirty(false);
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
    setIsDirty(true); 
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
      "Product",
      "Service",
      "Product & Service",
      "Trading",
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
    incubated: [
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

  const handleDomainChange = (selected: any) => {
    handleChange("domain", selected?.value || "");
  };

  const handleCreateDomain = async (inputValue: string) => {
    setIsDomainLoading(true);
    try {
      await databases.createDocument(
        STAGING_DATABASE_ID,
        DOMAIN_COLLECTION_ID,
        "unique()",
        { name: inputValue }
      );
      setDomainOptions(prev => [...prev, { label: inputValue, value: inputValue }]);
      handleChange("domain", inputValue);
    } catch (err) {
    } finally {
      setIsDomainLoading(false);
    }
  };


  const renderDomainDropdown = () => (
    <CreatableSelect
      isDisabled={!isEditing || isDomainLoading}
      isClearable
      isLoading={isDomainLoading}
      options={domainOptions}
      value={domainOptions.find(opt => opt.value === updatedData?.domain) || null}
      onChange={handleDomainChange}
      onCreateOption={handleCreateDomain}
      placeholder="Select or enter domain"
      formatCreateLabel={inputValue => `Add "${inputValue}"`}
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: state.isDisabled ? "white" : provided.backgroundColor,
          cursor: state.isDisabled ? "not-allowed" : "default",
          fontFamily: 'inherit',
          fontSize: '0.875rem', 
          color: '#000',
        }),
        input: (provided) => ({
          ...provided,
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          color: '#000',
          opacity: 1,
        }),
        placeholder: (provided) => ({
          ...provided,
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          color: '#000',
          opacity: 1,
        }),
        singleValue: (provided) => ({
          ...provided,
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          color: '#000',
          opacity: 1,
        }),
        menu: (provided) => ({
          ...provided,
          fontFamily: 'inherit',
          fontSize: '0.875rem',
        }),
        option: (provided, state) => ({
          ...provided,
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          cursor: (state.data as DomainOption).__isNew__ ? 'pointer' : 'default',
          color: '#000',
          opacity: 1,
        }),
      }}
    />
  );



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
      <div className="grid gap-4 bg-white mx-auto p-3 rounded-lg border border-gray-300">
        {[
          ["brandName", "natureOfCompany","registeredCompanyName", "businessModel"],
          ["businessType", "dateOfIncorporation", "domain", "subDomain"],
          ["companyStage", "patentsCertifications", "incubated", "revenue"],
          ["employees", "registeredCountry", "registeredState"],
        ].map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4">
            {row.map((key) => (
              <div key={key} className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center">
                  <Label className="font-semibold text-gray-700">
                    {fieldLabels[key] || key}
                  </Label>
                  {["registeredCompanyName", "dateOfIncorporation"].includes(key) && (
                    coiFileId ? (
                      <a
                        href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${coiFileId}/view?project=${PROJECT_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1"
                        title="View Certificate of Incorporation"
                      >
                        <FaEye className="ml-2 text-blue-500 hover:text-blue-700" size={20} />
                      </a>
                    ) : (
                      <FaEye className="ml-2 text-gray-400" size={20} title="Certificate of Incorporation not uploaded" />
                    )
                  )}
                  </div>
                  {key === "businessModel" ? (
                    <BusinessModelSelect
                      value={updatedData?.businessModel || []}
                      disabled={!isEditing}
                      onChange={(value) => handleChange("businessModel", value)}
                    />
                  ) : key === "dateOfIncorporation" ? (
                    <Input
                      type="date"
                      disabled={!isEditing}
                      value={updatedData?.[key] || ""}
                      max={receivedDate ? new Date(receivedDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  ) : key === "revenue" ? (
                    <Input
                      type="text"
                      placeholder="0 INR"
                      disabled={!isEditing}
                      value={`₹${updatedData?.[key] || "0"}`}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9,]/g, "");
                        const formattedValue = numericValue.replace(/,/g, "");
                        const parsedValue = parseInt(formattedValue, 10);
                        const finalValue = isNaN(parsedValue) ? "0" : parsedValue.toLocaleString("en-IN");
                        handleChange(key, finalValue);
                      }}
                    />
                  ) : key === "employees" ? (
                    <Input
                      type="number"
                      placeholder="0"
                      disabled={!isEditing}
                      value={updatedData?.[key] || ""}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, "");
                        handleChange(key, numericValue);
                      }}
                      min="0"
                    />
                  ) : ["companyStage", "businessType", "natureOfCompany", "domain", "incubated", "patentsCertifications"].includes(key) ? (
                    renderDropdown(key)
                  ) : (
                    <Input
                      disabled={!isEditing}
                      value={updatedData?.[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      onKeyPress={(e) => {
                        if (["subDomain", "registeredState", "registeredCountry"].includes(key) && !/[a-zA-Z\s]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default CompanyDetails;
