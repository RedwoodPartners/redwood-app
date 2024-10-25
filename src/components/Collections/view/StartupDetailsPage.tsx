"use client";

import React, { useState, useEffect } from "react";
import { DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config";

import FundingMilestones from "@/components/Collections/view/FundingMilestones";
import Compliance from "@/components/Collections/view/Compliance";
import Documents from "@/components/Collections/view/Documents";
import CompanyInformation from "@/components/Collections/view/CompanyInformation";


import RegulatoryInformation from "@/components/Collections/view/CompanyInfotabs/RegulatoryInformation";
import Contact from "@/components/Collections/view/CompanyInfotabs/Contact";
import AboutBusiness from "@/components/Collections/view/CompanyInfotabs/AboutBusiness";
import CustomerTestimonials from "@/components/Collections/view/CompanyInfotabs/CustomerTestimonials";

import FundRaisedSoFar from "@/components/Collections/view/FundingMilestonestabs/FundRaised";
import Shareholders from "@/components/Collections/view/FundingMilestonestabs/Shareholders";
import CapTable from "@/components/Collections/view/FundingMilestonestabs/CapTable";
import FundAsk from "@/components/Collections/view/FundingMilestonestabs/FundAsk";
import TranchesMilestones from "@/components/Collections/view/FundingMilestonestabs/Milestones";

import IncomeTaxCompliance from "@/components/Collections/view/Compliancetabs/IncomeTax";
import RocCompliance from "@/components/Collections/view/Compliancetabs/ROCcompliance";
import GstCompliance from "@/components/Collections/view/Compliancetabs/GSTcompliance";
import GstrCompliance from "@/components/Collections/view/Compliancetabs/GSTR1";
import Audits from "@/components/Collections/view/Compliancetabs/Audit";

import DocumentChecklist from "@/components/Collections/view/Documentstabs/DocumentsChecklist";
import Patents from "@/components/Collections/view/Documentstabs/Patents";
import Incubation from "@/components/Collections/view/Documentstabs/Incubation";


import InfoBox from "./Infobox";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface StartupDetailsPageProps {
  startupId: string | undefined;
}

interface StartupData {
  name: string;
}

const StartupDetailsPage: React.FC<StartupDetailsPageProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("companyInfo");

  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
          setStartupData({ name: data.name });
        } catch (error) {
          console.error("Error fetching startup details:", error);
          setError("Failed to fetch startup details. Please try again later.");
        }
      }
    };
    fetchStartupDetails();
  }, [startupId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "companyInfo":
        return <CompanyInformation activeTab={activeTab} setActiveTab={setActiveTab} />;
      case "regulatoryInfo":
        return <RegulatoryInformation />;
      case "contact":
        return <Contact />;
      case "aboutBusiness":
        return <AboutBusiness />;
      case "customerTestimonials":
        return <CustomerTestimonials />;

      case "fundingMilestones":
        return <FundingMilestones />;
      case "fundraisedsofar":
        return <FundRaisedSoFar />;
      case "shareholders":
        return <Shareholders />;
      case "captable":
        return <CapTable />;
      case "fundask":
        return <FundAsk />;
      case "milestones":
        return <TranchesMilestones />;

      case "compliance":
        return <Compliance />;

      case "incometax":
        return <IncomeTaxCompliance />;
      case "roccompliance":
        return <RocCompliance />;
      case "gstcompliance":
        return <GstCompliance />;
      case "gstrcompliance":
        return <GstrCompliance />;
      case "audits":
        return <Audits />;


      case "documents":
        return <Documents />;
        case "documentchecklist":
        return <DocumentChecklist />;
        case "patents":
        return <Patents />;
        case "incubation":
        return <Incubation />;
      default:
        return null;
    }
  };

  return (
    <div className="container w-screen p-2 mr-5 mt-5 mx-auto">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {startupData ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center text-gray-600">
                <span className="font-bold text-lg">{startupData.name.charAt(0)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{startupData.name}</h1>
            </div>
          </div>

          {/* Render InfoBox directly */}
          <InfoBox name={startupData.name} />

          {/* Tabs for Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-2 mt-4">
              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger onMouseEnter={() => setActiveTab("companyInfo")}>
                  Company Info
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 bg-white shadow-lg rounded-lg mt-2 z-50">
                  <ul>
                    <li>
                      <button
                        onClick={() => setActiveTab("companyInfo")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Company Details
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("regulatoryInfo")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Regulatory Information
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("contact")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Contact
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("aboutBusiness")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        About Business
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("customerTestimonials")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Customer Testimonials
                      </button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger onMouseEnter={() => setActiveTab("fundingMilestones")}>
                  Funding and Milestones
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-10">
                  <ul>
                    <li>
                      <button
                        onClick={() => setActiveTab("fundraisedsofar")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Fund raised so far
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("shareholders")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Shareholders
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("captable")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Cap Table
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("fundask")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Fund Ask
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("milestones")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Tranches Milestones
                      </button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger onMouseEnter={() => setActiveTab("incometax")}>
                  Compliance
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-10">
                  <ul>
                    <li>
                      <button
                        onClick={() => setActiveTab("incometax")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Income Tax
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("roccompliance")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        ROC Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("gstcompliance")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        GST Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("gstrcompliance")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        GSTR Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("audits")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Auidts
                      </button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger className="space-x-2" onMouseEnter={() => setActiveTab("documents")}>
                  Documents
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-10">
                  <ul>
                    <li>
                      <button
                        onClick={() => setActiveTab("documentchecklist")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Document Checklist
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("patents")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Patents
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("incubation")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Incubation
                      </button>
                    </li>
                    
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Render the active tab content */}
          <div className="mt-10">{renderTabContent()}</div>
        </>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default StartupDetailsPage;
