"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STAGING_DATABASE_ID,
  PROJECTS_ID,
  STARTUP_ID,
} from "@/appwrite/config";
import { databases } from "@/lib/utils";
import InfoBox from "./Infobox";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Import components for tabs
import CompanyInformation from "@/components/Collections/view/CompanyInformation";
import RegulatoryInformation from "@/components/Collections/view/CompanyInfotabs/RegulatoryInformation";
import Contact from "@/components/Collections/view/CompanyInfotabs/Contact";
import AboutBusiness from "@/components/Collections/view/CompanyInfotabs/AboutBusiness";
import CustomerTestimonials from "@/components/Collections/view/CompanyInfotabs/CustomerTestimonials";

import FundingMilestones from "@/components/Collections/view/FundingMilestones";
import FundRaisedSoFar from "@/components/Collections/view/FundingMilestonestabs/FundRaised";
import Shareholders from "@/components/Collections/view/FundingMilestonestabs/Shareholders";
import CapTable from "@/components/Collections/view/FundingMilestonestabs/CapTable";
import FundAsk from "@/components/Collections/view/FundingMilestonestabs/FundAsk";
import TranchesMilestones from "@/components/Collections/view/FundingMilestonestabs/Milestones";

import Compliance from "@/components/Collections/view/Compliance";
import IncomeTaxCompliance from "@/components/Collections/view/Compliancetabs/IncomeTax";
import RocCompliance from "@/components/Collections/view/Compliancetabs/ROCcompliance";
import GstCompliance from "@/components/Collections/view/Compliancetabs/GSTcompliance";
import GstrCompliance from "@/components/Collections/view/Compliancetabs/GSTR1";

import Documents from "@/components/Collections/view/Documents";
import DocumentChecklist from "@/components/Collections/view/Documentstabs/DocumentsChecklist";
import Patents from "@/components/Collections/view/Documentstabs/Patents";
import Incubation from "@/components/Collections/view/Documentstabs/Incubation";
import LoadingSpinner from "@/components/ui/loading";

type ProjectDetails = {
  id: string;
  name: string;
  startupId: string;
  startDate: string;
  receivedDate: string;
  projectEndDate: string;
  appliedFor: string;
  services: string;
  projectTemplate: string;
  startupStatus: string;
  stage: string;
};

type StartupDetails = {
  id: string;
  name: string;
};

const ProjectViewPage = ({ id }: { id: string }) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [startupData, setStartupData] = useState<StartupDetails | null>(null);
  const [activeTab, setActiveTab] = useState("companyInfo");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Fetch project details
        const response = await databases.getDocument(STAGING_DATABASE_ID, PROJECTS_ID, id);
        setProject({
          id: response.$id,
          name: response.name || "",
          startupId: response.startupId || "",
          startDate: response.startDate || "",
          receivedDate: response.receivedDate || "",
          projectEndDate: response.projectEndDate || "",
          appliedFor: response.appliedFor || "",
          services: response.services || "",
          projectTemplate: response.projectTemplate || "",
          startupStatus: response.startupStatus || "",
          stage: response.stage || "",
        });

        // Fetch startup details based on startupId
        if (response.startupId) {
          const startupResponse = await databases.getDocument(STAGING_DATABASE_ID, STARTUP_ID, response.startupId);
          setStartupData({
            id: startupResponse.$id,
            name: startupResponse.name || "Unknown Startup",
          });
        }
      } catch (error) {
        console.error("Error fetching project or startup details:", error);
        router.push("/projects"); // Redirect to projects page if ID is invalid
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, router]);

  
  if (loading) {
    return (
      <div>
        {/* Loading Spinner */}
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "companyInfo":
        return <CompanyInformation startupId={project?.startupId} activeTab={activeTab} setActiveTab={setActiveTab} />;
      case "regulatoryInfo":
        return <RegulatoryInformation startupId={project?.startupId}/>;
      case "contact":
        return <Contact startupId={project?.startupId}/>;
      case "aboutBusiness":
        return <AboutBusiness startupId={project?.startupId}/>;
      case "customerTestimonials":
        return <CustomerTestimonials startupId={project?.startupId}/>

      case "fundingMilestones":
        return <FundingMilestones startupId={project?.startupId} activeTab={activeTab} />;
      case "fundraisedsofar":
        return <FundRaisedSoFar startupId={project?.startupId} />;
      case "shareholders":
        return <Shareholders startupId={project?.startupId} />;
      case "captable":
        return <CapTable startupId={project?.startupId} />;
      case "fundask":
        return <FundAsk startupId={project?.startupId} />;
      case "milestones":
        return <TranchesMilestones startupId={project?.startupId} />;

      case "compliance":
        return <Compliance startupId={project?.startupId} activeTab={activeTab} />;
  
      case "incometax":
        return <IncomeTaxCompliance startupId={project?.startupId} />;
      case "roccompliance":
        return <RocCompliance startupId={project?.startupId} />;
      case "gstcompliance":
        return <GstCompliance startupId={project?.startupId} />;
      case "gstrcompliance":
        return <GstrCompliance startupId={project?.startupId} />;

      case "documents":
        return <Documents startupId={project?.startupId} activeTab={activeTab} />;
      case "documentchecklist":
        return <DocumentChecklist startupId={project?.startupId} />;
      case "patents":
        return <Patents startupId={project?.startupId} />;
      case "incubation":
        return <Incubation startupId={project?.startupId} />;

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-2">
        {startupData && (
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => router.push(`/startup/${startupData.id}`)}
              className="text-2xl font-semibold text-gray-800 px-1 hover:text-blue-500 transition"
            >
              {startupData.name}
            </button>
          </div>
        )}

        {/* Render InfoBox */}
        {project.startupId && <InfoBox startupId={project.startupId} projectId={project.id} />}

        {/* Tabs for Navigation */}
                  <NavigationMenu className="-ml-2">
                    <NavigationMenuList className="flex flex-wrap space-x-2 mt-2">
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="font-bold bg-transparent">
                          Company Information
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="absolute left-0 bg-white shadow-lg rounded-lg mt-2 w-full sm:w-64 z-20">
                          <ul className="flex flex-col">
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
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="font-bold bg-transparent">
                          Funding and Milestones
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="absolute left-0 sm:left-48 w-full bg-white shadow-lg rounded-lg mt-2 z-10">
                          <ul className="flex flex-col">
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
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="font-bold bg-transparent">
                          Compliance
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="absolute left-0 sm:left-96 w-full bg-white shadow-lg rounded-lg mt-2 z-10">
                          <ul className="flex flex-col">
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
                                onClick={() => setActiveTab("incometax")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Income Tax
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
                            
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger  className="font-bold bg-transparent">
                          Documents
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="absolute left-0 ml-36 sm:left-96 w-full bg-white shadow-lg rounded-lg mt-2">
                          <ul className="flex flex-col">
                            <li>
                              <button
                                onClick={() => setActiveTab("documentchecklist")}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Document Checklist
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => setActiveTab("patents")}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Patents
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => setActiveTab("incubation")}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
              <div className="mt-2 p-2">{renderTabContent()}</div>
       
      </div>
    </>
  );
};

export default ProjectViewPage;
