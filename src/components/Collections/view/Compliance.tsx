"use client";
import React, { useState } from "react";

import IncomeTaxCompliance from "./Compliancetabs/IncomeTax";
import RocCompliance from "./Compliancetabs/ROCcompliance";
import GstCompliance from "./Compliancetabs/GSTcompliance";
import GstrCompliance from "./Compliancetabs/GSTR1";
import ESICDetails from "./Compliancetabs/esic";

interface ComplianceProps {
  startupId: string;
  activeTab: string;
  setIsDirty: (isDirty: boolean) => void;
}

const Compliance: React.FC<ComplianceProps> = ({ activeTab, startupId, setIsDirty }) => {

  const renderTabContent = () => {
    switch (activeTab) {
      case "Income Tax Compliances":
        return <IncomeTaxCompliance startupId={startupId} setIsDirty={setIsDirty}/>;
      case "ROC Compliance":
        return <RocCompliance startupId={startupId} setIsDirty={setIsDirty}/>;
      case "GST Compliances":
        return <GstCompliance startupId={startupId} setIsDirty={setIsDirty}/>;
      case "GSTR-1 & GSTR-3B":
        return <GstrCompliance startupId={startupId} setIsDirty={setIsDirty}/>;
      case "esic":
        return <ESICDetails startupId={startupId} setIsDirty={setIsDirty}/>;
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
