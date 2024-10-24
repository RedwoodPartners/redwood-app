"use client";
import React, { useState } from "react";

import IncomeTaxCompliance from "./Compliancetabs/IncomeTax";
import RocCompliance from "./Compliancetabs/ROCcompliance";
import GstCompliance from "./Compliancetabs/GSTcompliance";
import GstrCompliance from "./Compliancetabs/GSTR1";
import Audits from "./Compliancetabs/Audit";


const Compliance: React.FC = () => {

  const [activeTab, setActiveTab] = useState("ROC Compliance");

  const tabs = [
    "ROC Compliance",
    "GST Compliances",
    "Income Tax Compliances",
    "GSTR-1 & GSTR-3B",
    "Audits",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Income Tax Compliances":
        return <IncomeTaxCompliance />;
      case "ROC Compliance":
        return <RocCompliance />;
      case "GST Compliances":
        return <GstCompliance />;
      case "GSTR-1 & GSTR-3B":
        return <GstrCompliance />;
      case "Audits":
        return <Audits />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52">
        <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
        {/* Render the content for the active tab */}
        {renderTabContent()}
      </div>

      
    </div>
  );
};

export default Compliance;
