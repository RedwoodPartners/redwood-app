"use client";

import React, { useState } from "react";
import CompanyDetails from "./CompanyInfotabs/CompanyDetails";
import RegulatoryInformation from "./CompanyInfotabs/RegulatoryInformation";
import Contact from "./CompanyInfotabs/Contact";
import AboutBusiness from "./CompanyInfotabs/AboutBusiness";
import CustomerTestimonials from "./CompanyInfotabs/CustomerTestimonials";

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

      <div className="hidden lg:flex flex-col fixed right-0 h-full -mt-3 w-52 border-l-black border-gray-300 bg-gray-800 text-white">
        <ul className="flex-grow p-5 space-y-4">
          {tabs.map((link, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab(link)}
                className={`block py-2 px-2 w-screen -ml-5 transition-colors text-left ${
                  activeTab === link ? "bg-white text-black" : "text-white"
                } hover:bg-white hover:text-black`}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompanyInformation;
