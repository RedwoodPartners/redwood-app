"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

import { STAGING_DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config";

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

import { Download } from "lucide-react";
import GenerateReport from '@/components/generate';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface StartupDetailsPageProps {
  startupId: string;
}

interface StartupData {
  name: string;
}




const StartupDetailsPage: React.FC<StartupDetailsPageProps> = ({ startupId }) => {
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("companyInfo");

  const [isDirty, setIsDirty] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (startupId) {
        try {
          const data = await databases.getDocument(STAGING_DATABASE_ID, STARTUP_ID, startupId);
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
        return <CompanyInformation startupId={startupId} activeTab={activeTab} setActiveTab={setActiveTab} setIsDirty={setIsDirty} />;
      case "regulatoryInfo":
        return <RegulatoryInformation startupId={startupId} setIsDirty={setIsDirty}/>;
      case "contact":
        return <Contact startupId={startupId} setIsDirty={setIsDirty}/>;
      case "aboutBusiness":
        return <AboutBusiness startupId={startupId} setIsDirty={setIsDirty}/>;
      case "customerTestimonials":
        return <CustomerTestimonials startupId={startupId} setIsDirty={setIsDirty}/>;

      case "fundingMilestones":
        return <FundingMilestones startupId={startupId} activeTab={activeTab} />;
      case "fundraisedsofar":
        return <FundRaisedSoFar startupId={startupId} />;
      case "shareholders":
        return <Shareholders startupId={startupId} />;
      case "captable":
        return <CapTable startupId={startupId} />;
      case "fundask":
        return <FundAsk startupId={startupId} />;
      case "milestones":
        return <TranchesMilestones startupId={startupId} />;

      case "compliance":
        return <Compliance startupId={startupId} activeTab={activeTab} />;

      case "incometax":
        return <IncomeTaxCompliance startupId={startupId} />;
      case "roccompliance":
        return <RocCompliance startupId={startupId} />;
      case "gstcompliance":
        return <GstCompliance startupId={startupId} />;
      case "gstrcompliance":
        return <GstrCompliance startupId={startupId} />;
      case "audits":
        return <Audits startupId={startupId} />;


      case "documents":
        return <Documents startupId={startupId} activeTab={activeTab} />;
        case "documentchecklist":
        return <DocumentChecklist startupId={startupId} />;
        case "patents":
        return <Patents startupId={startupId} />;
        case "incubation":
        return <Incubation startupId={startupId} />;
      default:
        return null;
    }
  };

  const handleTabChange = (newTab: string) => {
    if (isDirty) {
      setShowAlertDialog(true);
      setPendingTab(newTab);
    } else {
      setActiveTab(newTab);
    }
  };

  const confirmTabChange = () => {
    setIsDirty(false);
    setActiveTab(pendingTab!);
    setShowAlertDialog(false);
    setPendingTab(null);
  };

  const cancelTabChange = () => {
    setShowAlertDialog(false);
    setPendingTab(null);
  };

  return (
    <div className="p-2">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {startupData ? (
        <>
        {/* Alert Dialog */}
        <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to switch tabs?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelTabChange}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmTabChange}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
              <Label className="text-2xl font-semibold text-gray-800 ml-2">{startupData.name}</Label>
            {/* Download Button to generate report */}
            <div className="mr-5 border border-gray-100 rounded-2xl ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                  <GenerateReport startupId={startupId} />
                  <div onClick={() => document.getElementById("generateReportBtn")?.click()} className="hover:text-red-500 transition-colors duration-300">
                    <Download className="" />
                  </div>
                  </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate First Connect Report</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
          </div>

          {/* Tabs for Navigation */}
          <NavigationMenu className="-ml-2">
            <NavigationMenuList className="flex flex-wrap space-x-2 mt-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-bold bg-transparent">
                  Company Information
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 bg-white shadow-lg rounded-lg w-full sm:w-64 z-20">
                  <ul className="flex flex-col text-sm font-semibold">
                    <li>
                      <button
                        onClick={() => handleTabChange("companyInfo")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Company Details
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange("regulatoryInfo")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Regulatory Information
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange("contact")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Contact
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange("aboutBusiness")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        About Business
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleTabChange("customerTestimonials")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Customer Testimonials
                      </button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-bold bg-transparent">
                  Funding and Milestones
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 sm:left-48 w-full bg-white shadow-lg rounded-lg z-10">
                  <ul className="flex flex-col text-sm font-semibold">
                    <li>
                      <button
                        onClick={() => setActiveTab("fundraisedsofar")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Funds Raised So Far
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("shareholders")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Shareholders
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("captable")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Cap Table
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("fundask")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Fund Ask
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("milestones")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Tranches Milestones
                      </button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-bold bg-transparent">
                  Compliance
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 sm:left-96 w-full bg-white shadow-lg rounded-lg z-10">
                  <ul className="flex flex-col text-sm font-semibold">
                    <li>
                      <button
                        onClick={() => setActiveTab("roccompliance")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        ROC Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("incometax")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Income Tax
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("gstcompliance")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        GST Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("gstrcompliance")}
                        className="block w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        GSTR Compliance
                      </button>
                    </li>
                    
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger  className="font-bold bg-transparent">
                  Documents
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute left-0 ml-36 sm:left-96 w-full bg-white shadow-lg rounded-lg">
                  <ul className="flex flex-col text-sm font-semibold">
                    <li>
                      <button
                        onClick={() => setActiveTab("documentchecklist")}
                        className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Document Checklist
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("patents")}
                        className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Patents
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("incubation")}
                        className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100"
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
          <div className="mt-3 p-2">{renderTabContent()}</div>
        </>
      ) : (
        /*Loading*/
        <div className="flex justify-center mt-56">
          <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
          <title id="title">Loading...</title>
          <circle cx="50" cy="50" r="35" stroke="gray" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="55 35">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
          </circle>
          </svg>
        </div>

      )}
    </div>
  );
};

export default StartupDetailsPage;