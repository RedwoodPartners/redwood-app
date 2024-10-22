"use client";

import React, { useState } from "react";
import CompanyDetails from "./CompanyInfotabs/CompanyDetails";
import RegulatoryInformation from "./CompanyInfotabs/RegulatoryInformation";
import Contact from "./CompanyInfotabs/Contact";
import AboutBusiness from "./CompanyInfotabs/AboutBusiness";
import CustomerTestimonials from "./CompanyInfotabs/CustomerTestimonials";
import RightSidebar from "./RightSidebar";

const CompanyInformation: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Company Details");

  const tabs = [
    "Company Details",
    "Regulatory Information",
    "Contact",
    "About Business",
    "Customer Testimonials",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Company Details":
        return <CompanyDetails />;
      case "Regulatory Information":
        return <RegulatoryInformation />;
      case "Contact":
        return <Contact />;
      case "About Business":
        return <AboutBusiness />;
      case "Customer Testimonials":
        return <CustomerTestimonials />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52">
        {renderTabContent()}
      </div>

      {/* Render the RightSidebar component */}
      <RightSidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={setActiveTab}
      />
    </div>
  );
};

export default CompanyInformation;
