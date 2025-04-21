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
  setIsDirty: (isDirty: boolean) => void;
}

const FundingMilestones: React.FC<FundingMilestonesProps> = ({ activeTab, startupId, setIsDirty }) => {
  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Fund Raised So Far":
        return <FundRaisedSoFar startupId={startupId} setIsDirty={setIsDirty}/>;
      case "Shareholders":
        return <Shareholders startupId={startupId} setIsDirty={setIsDirty}/>;
      case "Cap Table":
        return <CapTable startupId={startupId} setIsDirty={setIsDirty}/>;
      case "Fund Ask":
        return <FundAsk startupId={startupId} setIsDirty={setIsDirty}/>;
      case "Tranches & Milestones":
        return <TranchesMilestones startupId={startupId} setIsDirty={setIsDirty}/>;
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

export default FundingMilestones;
