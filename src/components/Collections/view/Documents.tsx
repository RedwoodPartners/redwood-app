"use client";

import React, { useState } from "react";
import DocumentChecklist from "./Documentstabs/DocumentsChecklist";
import Patents from "./Documentstabs/Patents";
import Incubation from "./Documentstabs/Incubation";
import RightSidebar from "./RightSidebar";

const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Document Checklist");

  const tabs = ["Document Checklist", "Patents", "Incubation"];

  const renderActiveSection = () => {
    switch (activeTab) {
      case "Document Checklist":
        return <DocumentChecklist />;
      case "Patents":
        return <Patents />;
      case "Incubation":
        return <Incubation />;
      default:
        return <DocumentChecklist />;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52">
        <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
        {renderActiveSection()}
      </div>

      {/* Render the RightSidebar */}
      <RightSidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={setActiveTab}
      />
    </div>
  );
};

export default Documents;
