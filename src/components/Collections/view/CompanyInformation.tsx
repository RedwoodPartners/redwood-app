"use client";

import React from "react";
import CompanyDetails from "./CompanyInfotabs/CompanyDetails";
import RegulatoryInformation from "./CompanyInfotabs/RegulatoryInformation";
import Contact from "./CompanyInfotabs/Contact";
import AboutBusiness from "./CompanyInfotabs/AboutBusiness";
import CustomerTestimonials from "./CompanyInfotabs/CustomerTestimonials";

interface CompanyInformationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startupId: string;
  setIsDirty: (isDirty: boolean) => void;
}

const CompanyInformation: React.FC<CompanyInformationProps> = ({ activeTab, setActiveTab, startupId, setIsDirty }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "companyInfo":
      case "Company Details":
        return <CompanyDetails startupId={startupId} setIsDirty={setIsDirty}/>;
      case "regulatoryInfo":
      case "Regulatory Information":
        return <RegulatoryInformation startupId={startupId} setIsDirty={setIsDirty}/>;
      case "contact":
      case "Contact":
        return <Contact startupId={startupId} setIsDirty={setIsDirty}/>;
      case "aboutBusiness":
      case "About Business":
        return <AboutBusiness startupId={startupId} setIsDirty={setIsDirty}/>;
      case "customerTestimonials":
      case "Customer Testimonials":
        return <CustomerTestimonials startupId={startupId} setIsDirty={setIsDirty}/>;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <div className="flex-grow">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CompanyInformation;
