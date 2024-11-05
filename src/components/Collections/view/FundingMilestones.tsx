"use client";

import React, { useState } from "react";

import FundRaisedSoFar from "./FundingMilestonestabs/FundRaised";
import Shareholders from "./FundingMilestonestabs/Shareholders";
import CapTable from "./FundingMilestonestabs/CapTable";
import FundAsk from "./FundingMilestonestabs/FundAsk";
import TranchesMilestones from "./FundingMilestonestabs/Milestones";


const FundingMilestones: React.FC = () => {
  // State to track the active sidebar tab
  const [activeTab, setActiveTab] = useState("Fund Raised So Far");

  const tabs = [
    "Fund Raised So Far",
    "Shareholders",
    "Cap Table",
    "Fund Ask",
    "Tranches & Milestones",
  ];

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Fund Raised So Far":
        return <FundRaisedSoFar />;
      case "Shareholders":
        return <Shareholders />;
      case "Cap Table":
        return <CapTable />;
      case "Fund Ask":
        return <FundAsk />;
      case "Tranches & Milestones":
        return <TranchesMilestones />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow">
        <h2 className="text-xl font-bold mb-4">Funding & Milestones</h2>
        {/* Render the content for the active tab */}
        {renderTabContent()}
      </div>

      
    </div>
  );
};

export default FundingMilestones;
