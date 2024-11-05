"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
          setStartupData({
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
            incubated: data.incubated ? "Yes" : "No",
            communityCertificate: data.communityCertificate ? "Yes" : "No",
            patentsCertifications: data.patentsCertifications ? "Yes" : "No",
            revenue: data.revenue,
            employees: data.employees,
          });
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
        }
      }
    };
    fetchStartupDetails();
  }, [startupId]);

  if (!startupData) {
    return <div>{error || "Loading..."}</div>;
  }

  return (
    <>
      <h2 className="container text-xl font-bold mb-4 -mt-6">Company Details</h2>
      <div className="grid grid-cols-5 gap-4 mt-2">
        {[
          [["Brand Name", startupData.brandName], ["Date of Incorporation", startupData.dateOfIncorporation], ["Company Stage", startupData.companyStage]],
          [["Business Type", startupData.businessType], ["Registered Company Name", startupData.registeredCompanyName], ["Registered Country", startupData.registeredCountry]],
          [["Nature of the Company", startupData.natureOfCompany], ["Registered State", startupData.registeredState], ["Domain", startupData.domain]],
          [["Sub Domain", startupData.subDomain], ["Incubated?", startupData.incubated], ["Community Certificate?", startupData.communityCertificate]],
          [["Patents & Certifications?", startupData.patentsCertifications], ["Revenue (last FY)", startupData.revenue], ["Employees (last FY)", startupData.employees]],
        ].map((columnData, columnIndex) => (
          <div key={columnIndex} className="space-y-4 border-r border-dotted border-gray-300 pr-4">
            {columnData.map(([label, value]) => (
              <div key={label} className="flex flex-col space-y-1.5">
                <Label className="font-semibold text-gray-700">{label}</Label>
                <Input className="text-black" disabled defaultValue={value} readOnly />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default CompanyDetails;
