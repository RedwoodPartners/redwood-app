"use client";

import React, { useState } from "react";

import FundRaisedSoFar from "./FundingMilestonestabs/FundRaised";
import Shareholders from "./FundingMilestonestabs/Shareholders";
import CapTable from "./FundingMilestonestabs/CapTable";
import FundAsk from "./FundingMilestonestabs/FundAsk";
import TranchesMilestones from "./FundingMilestonestabs/Milestones";

interface FundingMilestonesProps {
  startupId: string;
  activeTab: string;
}

const FundingMilestones: React.FC<FundingMilestonesProps> = ({ activeTab, startupId }) => {
  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Fund Raised So Far":
        return <FundRaisedSoFar startupId={startupId} />;
      case "Shareholders":
        return <Shareholders />;
      case "Cap Table":
        return <CapTable startupId={startupId} />;
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
      <div className="bg-white mx-auto p-4 rounded-lg shadow-md flex-grow">
        {/* Render the content for the active tab */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default FundingMilestones;
