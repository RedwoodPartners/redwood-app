"use client";

import React, { useState } from "react";

import DocumentChecklist from "./Documentstabs/DocumentsChecklist";
import Patents from "./Documentstabs/Patents";
import Incubation from "./Documentstabs/Incubation";

interface DocumentsProps {
  startupId: string;
  activeTab: string;
}

const Documents: React.FC<DocumentsProps> = ({ activeTab, startupId }) => {

  const renderTabContent = () => {
    switch (activeTab) {
      case "Document Checklist":
        return <DocumentChecklist startupId={startupId} />;
      case "Patents":
        return <Patents startupId={startupId} />;
      case "Incubation":
        return <Incubation startupId={startupId} />;
      default:
        return <DocumentChecklist startupId={startupId} />;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-grow">
        {renderTabContent()}
      </div>

      
    </div>
  );
};

export default Documents;
