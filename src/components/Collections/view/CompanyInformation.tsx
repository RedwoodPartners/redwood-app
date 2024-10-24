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
}

const CompanyInformation: React.FC<CompanyInformationProps> = ({ activeTab, setActiveTab }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "companyInfo":
      case "Company Details":
        return <CompanyDetails />;
      case "regulatoryInfo":
      case "Regulatory Information":
        return <RegulatoryInformation />;
      case "contact":
      case "Contact":
        return <Contact />;
      case "aboutBusiness":
      case "About Business":
        return <AboutBusiness />;
      case "customerTestimonials":
      case "Customer Testimonials":
        return <CustomerTestimonials />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <div className="bg-white mx-auto p-4 rounded-lg shadow-md flex-grow">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CompanyInformation;
