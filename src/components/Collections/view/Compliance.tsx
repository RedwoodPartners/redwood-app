"use client";
import React, { useState } from "react";

import IncomeTaxCompliance from "./Compliancetabs/IncomeTax";
import RocCompliance from "./Compliancetabs/ROCcompliance";
import GstCompliance from "./Compliancetabs/GSTcompliance";
import GstrCompliance from "./Compliancetabs/GSTR1";
import Audits from "./Compliancetabs/Audit";

interface ComplianceProps {
  startupId: string;
  activeTab: string;
}

const Compliance: React.FC<ComplianceProps> = ({ activeTab, startupId }) => {

  const renderTabContent = () => {
    switch (activeTab) {
      case "Income Tax Compliances":
        return <IncomeTaxCompliance startupId={startupId} />;
      case "ROC Compliance":
        return <RocCompliance startupId={startupId} />;
      case "GST Compliances":
        return <GstCompliance startupId={startupId} />;
      case "GSTR-1 & GSTR-3B":
        return <GstrCompliance startupId={startupId} />;
      case "Audits":
        return <Audits startupId={startupId} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-grow">
        {/* Render the content for the active tab */}
        {renderTabContent()}
      </div>

      
    </div>
  );
};

export default Compliance;
