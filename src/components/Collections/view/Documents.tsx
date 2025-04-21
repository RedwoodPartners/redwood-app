"use client";

import React, { useState } from "react";

import DocumentChecklist from "./Documentstabs/DocumentsChecklist";
import Patents from "./Documentstabs/Patents";
import Incubation from "./Documentstabs/Incubation";

interface DocumentsProps {
  startupId: string;
  activeTab: string;
  setIsDirty: (isDirty: boolean) => void;
}

const Documents: React.FC<DocumentsProps> = ({ activeTab, startupId, setIsDirty }) => {

  const renderTabContent = () => {
    switch (activeTab) {
      case "Document Checklist":
        return <DocumentChecklist startupId={startupId} setIsDirty={setIsDirty}/>;
      case "Patents":
        return <Patents startupId={startupId} setIsDirty={setIsDirty}/>;
      case "Incubation":
        return <Incubation startupId={startupId} setIsDirty={setIsDirty}/>;
      default:
        return <DocumentChecklist startupId={startupId} setIsDirty={setIsDirty}/>;
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
