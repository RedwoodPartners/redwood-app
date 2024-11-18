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
        return <DocumentChecklist />;
      case "Patents":
        return <Patents startupId={startupId} />;
      case "Incubation":
        return <Incubation />;
      default:
        return <DocumentChecklist />;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow">
        <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
        {renderTabContent()}
      </div>

      
    </div>
  );
};

export default Documents;
