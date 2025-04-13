"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  STAGING_DATABASE_ID,
  PROJECTS_ID,
  STARTUP_ID
} from "@/appwrite/config";
import { client, databases } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash } from "lucide-react";
import { FaEye } from "react-icons/fa";
import { Checkbox } from "../ui/checkbox";

import { nanoid } from "nanoid";
import LoadingSpinner from "../ui/loading";
import { Query } from "appwrite";

type Project = {
  id: string;
  name: string;
  startupId: string;
  startDate: string;
  receivedDate: string;
  projectEndDate: string;
  appliedFor: string;
  services: string;
  projectTemplate: string;
  client: string;
  startupStatus: string;
  stage: string;
  founderName?: string;
  phoneNumber?: string;
};

type Startup = {
  id: string;
  name: string;
  founderName?: string; 
  phoneNumber?: string;
  projects?: string[];
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectCountError, setProjectCountError] = useState<string | null>(null);

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingNewRecord, setIsCreatingNewRecord] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [customService, setCustomService] = useState("");
  
  const [isDuplicateCheckPassed, setIsDuplicateCheckPassed] = useState(false);
  const [isCheckingDuplication, setIsCheckingDuplication] = useState(false);
  const [isFormModified, setIsFormModified] = useState(false);
   
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);

  const [isForm2Disabled, setIsForm2Disabled] = useState(true); 
  const [isForm1Disabled, setIsForm1Disabled] = useState(false);

  const [isDuplicationButtonVisible, setIsDuplicationButtonVisible] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, PROJECTS_ID);
        const projectData = response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name || "",
          startupId: doc.startupId || "",
          startDate: doc.startDate || "",
          receivedDate: doc.receivedDate || "",
          projectEndDate: doc.projectEndDate || "",
          appliedFor: doc.appliedFor || "",
          services: doc.services || "",
          projectTemplate: doc.projectTemplate || "",
          client: doc.client || "",
          startupStatus: doc.startupStatus || "",
          stage: doc.stage || "",
        }));
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }finally {
        setLoading(false);
      }
    };

    // Fetch startups and initialize filteredStartups
    const fetchStartups = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, STARTUP_ID);
        const startupData = response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name || "",
        }));
        setStartups(startupData);
        setFilteredStartups(startupData);
      } catch (error) {
        console.error("Error fetching startups:", error);
      }
    };

    fetchProjects();
    fetchStartups();
  }, []);
  // Update filtered startups when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStartups(startups); // Show all startups if query is empty
    } else {
      setFilteredStartups(
        startups.filter((startup) =>
          startup.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, startups]);
  useEffect(() => {
    setIsForm1Disabled(!isForm2Disabled);
  }, [isForm2Disabled]);
  


  // Open dialog for adding a new project
  const handleAddNewProject = () => {
    setEditedProject({
      id: "",
      name: "",
      startupId: "",
      startDate: "",
      receivedDate: "",
      projectEndDate: "",
      appliedFor: "",
      services: "",
      projectTemplate: "",
      client: "",
      startupStatus: "Pipeline",
      stage: "",
    });
    setIsAddingNewProject(true);
    setShowModal(true);
  };
 
  const handleConfirmChanges = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
  
    if (editedProject) {
      // Automatically set Project End Date if template is TANSIM
      if (editedProject.projectTemplate === "TANSIM" && editedProject.startDate) {
        editedProject.projectEndDate = calculateEndDate(editedProject.startDate);
      }
      // Step 2 validation for required fields
        if (!editedProject.startupId || !editedProject.receivedDate || !editedProject.projectTemplate || !editedProject.services || (editedProject?.services === "BDD" && !editedProject?.client)) {
            setIsSubmitting(false);
            return;
        }
      // Generate `projectId`
      const generatedProjectId = nanoid(6);
  
      try {
        if (isAddingNewProject) {
          // Add a new project
          const response = await databases.createDocument(
            STAGING_DATABASE_ID,
            PROJECTS_ID,
            generatedProjectId,
            {
              name: editedProject.name,
              startupId: editedProject.startupId, // Use the startupId from state
              startDate: editedProject.startDate,
              receivedDate: editedProject.receivedDate,
              projectEndDate: editedProject.projectEndDate,
              appliedFor: editedProject.appliedFor,
              services: editedProject.services === "Other" ? customService : editedProject.services,
              projectTemplate: editedProject.projectTemplate,
              client: editedProject.client,
              startupStatus: editedProject.startupStatus,
              stage: editedProject.stage,
            }
          );
  
          setProjects((prev) => [
            ...prev,
            { ...editedProject, id: response.$id },
          ]);
  
          // Update startup document with new project ID
          const existingStartup = await databases.getDocument(
            STAGING_DATABASE_ID,
            STARTUP_ID,
            editedProject.startupId
          );
  
          const existingProjects = existingStartup.projects || [];
  
          const updatedProjects = [...existingProjects, response.$id];
  
          await databases.updateDocument(
            STAGING_DATABASE_ID,
            STARTUP_ID,
            editedProject.startupId,
            { projects: updatedProjects }
          );
  
          router.push(`/projects/${response.$id}`); // Redirect to the new project
        } else {
          // Update an existing project
          await databases.updateDocument(
            STAGING_DATABASE_ID,
            PROJECTS_ID,
            editedProject.id,
            {
              name: editedProject.name,
              startupId: editedProject.startupId,
              startDate: editedProject.startDate,
              receivedDate: editedProject.receivedDate,
              projectEndDate: editedProject.projectEndDate,
              appliedFor: editedProject.appliedFor,
              services: editedProject.services,
              projectTemplate: editedProject.projectTemplate,
              client: editedProject.client,
              startupStatus: editedProject.startupStatus,
              stage: editedProject.stage,
            }
          );
  
          setProjects((prev) =>
            prev.map((project) =>
              project.id === editedProject.id ? editedProject : project
            )
          );
        }
  
        setEditedProject(null);
        setShowModal(false);
        setIsAddingNewProject(false);
        setErrorMessage(null);
      } catch (error) {
        console.error("Error saving project:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  

  // Delete a project
  const handleDeleteProject = async () => {
    if (editedProject && !isAddingNewProject) {
      try {
        await databases.deleteDocument(STAGING_DATABASE_ID, PROJECTS_ID, editedProject.id);
        setProjects((prev) =>
          prev.filter((project) => project.id !== editedProject.id)
        );

        setEditedProject(null);
        setShowModal(false);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };
  
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB").format(date); // Formats as DD/MM/YYYY
  };

  const calculateEndDate = (startDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 45); // Add 45 days
    return end.toISOString().split("T")[0];
  };

  const handleDeleteSelectedProjects = async () => {
    try {
      await Promise.all(
        selectedProjects.map((projectId) =>
          databases.deleteDocument(STAGING_DATABASE_ID, PROJECTS_ID, projectId)
        )
      );

      // Update state after deletion
      setProjects((prev) =>
        prev.filter((project) => !selectedProjects.includes(project.id))
      );
      setSelectedProjects([]); // Clear selection
    } catch (error) {
      console.error("Error deleting projects:", error);
    }
  };
  const handleInputChange = () => {
    setIsCreatingNewRecord(false);
    setIsDuplicateCheckPassed(false);
    setIsFormModified(true);
    setProjectCountError(null);
    setIsDuplicationButtonVisible(true);
  };
  const checkFormValidity = () => {
    if (editedProject) {
      const isClientMandatory = editedProject.services === "BDD";
      const isValid = Boolean(
        editedProject.name && 
        editedProject.founderName && 
        editedProject.phoneNumber &&
        (!isClientMandatory || editedProject.client) // 'client' is mandatory only if 'services' is 'BDD'
      );
      setIsFormValid(isValid);
    } else {
      setIsFormValid(false);
    }
  };
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
  
  //Duplication Check and creating a new startup record 
  const fetchExistingStartup = async (): Promise<Startup | undefined> => {
    try {
      const existingStartup = await databases.listDocuments(STAGING_DATABASE_ID, STARTUP_ID);
      const startupData: Startup[] = existingStartup.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        founderName: doc.founderName,
        phoneNumber: doc.phoneNumber,
      }));
  
      return startupData.find(
        (startup) =>
          startup.name.toLowerCase() === editedProject?.name?.toLowerCase() ||
          startup.founderName?.toLowerCase() === editedProject?.founderName?.toLowerCase() ||
          startup.phoneNumber === editedProject?.phoneNumber
      );
    } catch (error) {
      console.error("Error fetching startup:", error);
      return undefined;
    }
  };
  
  const handleContinueWithExistingStartup = async () => {
    try {
      const existingStartupDoc = await fetchExistingStartup();

      if (existingStartupDoc) {
        setEditedProject({
          ...editedProject!,
          startupId: existingStartupDoc.id,
          name: existingStartupDoc.name,
          founderName: existingStartupDoc.founderName,  
          phoneNumber: existingStartupDoc.phoneNumber,
        });
        setCurrentStep(2);
        setErrorMessage(null);
        setIsForm2Disabled(false);
        setIsForm1Disabled(true);
        setIsDuplicationButtonVisible(false);
        setProjectCountError(null);
      }
    } catch (error) {
      console.error("Error continuing with existing startup:", error);
    }
  };

  const fetchProjectStatusesForStartup = async (startupId: string): Promise<string[]> => {
    try {
      const response = await databases.listDocuments(
        STAGING_DATABASE_ID,
        PROJECTS_ID,
        [Query.equal("startupId", startupId)]
      );
  
      // Extract and return the startupStatus values
      return response.documents.map((doc: any, index: number) => 
        `Project ${index + 1} Status: ${doc.startupStatus || "Unknown"}`
      );
    } catch (error) {
      console.error("Error fetching project statuses:", error);
      return [];
    }
  };
  

  const handleCreateOrUpdateStartup = async () => {
    setIsCheckingDuplication(true);

    try {
      const existingStartupDoc = await fetchExistingStartup();
      
      if (existingStartupDoc) {
        handleDuplicateError(existingStartupDoc);
        setIsDuplicateCheckPassed(false);
        
        setCurrentStartup(existingStartupDoc);
        // Fetch project statuses for existing startup
        const projectStatuses = await fetchProjectStatusesForStartup(existingStartupDoc.id);
        setProjectCountError(projectStatuses.join(", "));
      } else {
        setIsDuplicateCheckPassed(true);
        setIsFormModified(false);
        setErrorMessage(null);
        setCurrentStartup(null);
      }
    } catch (error) {
      console.error("Error during duplication check:", error);
    } finally {
      setIsCheckingDuplication(false);
    }
  };
  

  const handleDuplicateError = (existingStartupDoc: Startup) => {
    if (
      existingStartupDoc.name.toLowerCase() === editedProject?.name?.toLowerCase() &&
      existingStartupDoc.founderName?.toLowerCase() === editedProject?.founderName?.toLowerCase() &&
      existingStartupDoc.phoneNumber === editedProject?.phoneNumber
    ) {
      setErrorMessage(
        `Startup with Name "${editedProject?.name}", Founder "${editedProject?.founderName}", and Phone Number "${editedProject?.phoneNumber}" already exists in startup record "${existingStartupDoc.name}".`
      );
    } else if (
      existingStartupDoc.name.toLowerCase() === editedProject?.name?.toLowerCase() &&
      existingStartupDoc.founderName?.toLowerCase() === editedProject?.founderName?.toLowerCase()
    ) {
      setErrorMessage(
        `Startup with Name "${editedProject?.name}" and Founder "${editedProject?.founderName}" already exists in startup record "${existingStartupDoc.name}"`
      );
    } else if (
      existingStartupDoc.name.toLowerCase() === editedProject?.name?.toLowerCase() &&
      existingStartupDoc.phoneNumber === editedProject?.phoneNumber
    ) {
      setErrorMessage(
        `Startup with Name "${editedProject?.name}" and Phone Number "${editedProject?.phoneNumber}" already exists in startup record "${existingStartupDoc.name}".`
      );
    } else if (
      existingStartupDoc.founderName?.toLowerCase() === editedProject?.founderName?.toLowerCase() &&
      existingStartupDoc.phoneNumber === editedProject?.phoneNumber
    ) {
      setErrorMessage(
        `Startup with Founder "${editedProject?.founderName}" and Phone Number "${editedProject?.phoneNumber}" already exists in startup record "${existingStartupDoc.name}".`
      );
    } else if (existingStartupDoc.name.toLowerCase() === editedProject?.name?.toLowerCase()) {
      setErrorMessage(`Startup with Name "${editedProject?.name}" already exists in startup record "${existingStartupDoc.name}".`);
    } else if (existingStartupDoc.founderName?.toLowerCase() === editedProject?.founderName?.toLowerCase()) {
      setErrorMessage(`Startup with Founder "${editedProject?.founderName}" already exists in startup record "${existingStartupDoc.name}".`);
    } else if (existingStartupDoc.phoneNumber === editedProject?.phoneNumber) {
      setErrorMessage(`Startup with Phone Number "${editedProject?.phoneNumber}" already exists in startup record "${existingStartupDoc.name}".`);
    }
  };
  
  const createOrUpdateStartup = async () => {
    try {
      const response = await databases.createDocument(
        STAGING_DATABASE_ID,
        STARTUP_ID,
        nanoid(6),
        {
          name: editedProject!.name,
          founderName: editedProject!.founderName,
          phoneNumber: editedProject!.phoneNumber,
          year: formattedDate,
        }
      );

      setEditedProject({
        ...editedProject!,
        startupId: response.$id,
      });
    } catch (error) {
      console.error("Error creating or updating startup:", error);
    }
  };

  const handleCreateNewStartup = async () => {
    setIsCreatingNewRecord(true);
    try {
      await createOrUpdateStartup();
      setCurrentStep(2);
      setIsDuplicateCheckPassed(false);
      setIsForm2Disabled(false);
      setIsForm1Disabled(true);
      setIsDuplicationButtonVisible(false);
    } catch (error) {
      console.error("Error creating startup:", error);
    } finally {
      setIsCreatingNewRecord(false);
    }
  };
  


  return (
    <div className="p-2">
      <div className="flex space-x-3 mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="flex items-center space-x-2">
          <>
          <span onClick={handleAddNewProject} className="flex items-center border border-gray-200 rounded-full cursor-pointer p-1 hover:border-green-500 space-x-1">
              <PlusCircle size={15}  className="cursor-pointer"/>
              <span className="text-xs">Add</span>
          </span>
          </>
          <>
            <span onClick={handleDeleteSelectedProjects} className="flex items-center border border-gray-200 rounded-full cursor-pointer p-1 hover:border-red-500 space-x-1">
              <Trash size={15}/>
              <span className="text-xs">Remove</span>
            </span>
          </>
        </div>
      </div>
      {/* Loading Indicator */}
      {loading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
      <div className="bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>View</TableHead>
              <TableHead>Startup Name</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Project End Date</TableHead>
              <TableHead>Funding Need</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project Template</TableHead>
              <TableHead>Project Status</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              // Find the corresponding startup for the project
              const startup = startups.find((s) => s.name === project.name);
              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedProjects((prev) => [...prev, project.id]);
                      } else {
                        setSelectedProjects((prev) =>
                        prev.filter((id) => id !== project.id)
                      );
                      }
                    }}
                    />
                    </TableCell>

                  <TableCell>
                    <button
                      className="bg-transparent text-gray-600 hover:text-blue-700 px-2 py-1 border border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50"
                      title="View Startup"
                      onClick={() => {
                        if (startup) {
                          router.push(`/projects/${project.id}`); // Redirect to the project
                        } else {
                          console.error("Startup not found for redirection.");
                        }
                      }}
                    >
                      <FaEye size={18} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      className="hover:text-blue-600"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                    {project.name}
                    </button>
                  </TableCell>
                  <TableCell>{formatDate(project.receivedDate)}</TableCell>
                  <TableCell>{formatDate(project.startDate)}</TableCell>
                  <TableCell>{formatDate(project.projectEndDate)}</TableCell>
                  <TableCell>{project.appliedFor}</TableCell>
                  <TableCell>{project.services}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.projectTemplate}</TableCell>
                  <TableCell>{project.startupStatus}</TableCell>
                  <TableCell>{project.stage}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      )}
      {editedProject && (
        <Dialog open={showModal} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setErrorMessage(null);
            setProjectCountError(null);
            setIsForm1Disabled(false);
            setIsForm2Disabled(true);
          }
          setShowModal(isOpen);
        }}>
          <DialogContent className="w-full max-w-5xl p-6 max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isAddingNewProject ? "Add New Project" : "Edit Project"}
              </DialogTitle>
              <DialogDescription>
                Enter Startup Details to check Project Status
              </DialogDescription>
              {(errorMessage || projectCountError) && (
              <div>
                {errorMessage && (
                  <Label className="text-red-500 text-base mb-1">{errorMessage}</Label>
                )}
                {projectCountError && (
                  <div className="text-gray-800 text-base mt-2">
                    <Label className="flex text-lg">Previous Projects for {currentStartup?.name}</Label>
                    {projectCountError.split(', ').map((status, index) => (
                      <Label className="flex text-sm mt-2" key={index}>{status}</Label>
                    ))}
                  </div>
                )}
              </div>
            )}
            </DialogHeader>
            {/*Form 1*/}
              <div className={`grid grid-cols-3 gap-4 py-2 ${isForm1Disabled ? 'opacity-60 pointer-events-none' : ''}`}>
                <div>
                  <Label htmlFor="name">Startup Name<span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={editedProject?.name || ""}
                    onChange={(e) => {
                      handleInputChange();
                      setEditedProject({
                        ...editedProject!,
                        name: e.target.value,
                      });
                      setErrorMessage(null); 
                      checkFormValidity();
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="founderName">Founder Name<span className="text-red-500">*</span></Label>
                  <Input
                    id="founderName"
                    value={editedProject.founderName || ""}
                    onChange={(e) => {
                      handleInputChange();
                      setEditedProject({
                        ...editedProject!,
                        founderName: e.target.value,
                      });
                      setErrorMessage(null);
                      checkFormValidity();
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number<span className="text-red-500">*</span></Label>
                  <Input
                    id="phoneNumber"
                    type="number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={editedProject.phoneNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange();
                      setEditedProject({
                        ...editedProject!,
                        phoneNumber: e.target.value,
                      });
                      setErrorMessage(null);
                      checkFormValidity();
                    }}
                  />
                    {editedProject.phoneNumber && editedProject.phoneNumber.length !== 10 && (
                      <p className="text-red-500 text-sm">Phone number must be 10 digits</p>
                    )}
                </div>
                </div>
                <div className="text-right">
                {errorMessage ? (
                  <Button onClick={handleContinueWithExistingStartup}>
                    Continue with Existing Startup
                  </Button>
                ) : isDuplicateCheckPassed && !isFormModified ? (
                  <div className="flex justify-end items-center gap-4">
                    <span className="text-green-600 text-sm">
                      Duplication check passed!
                    </span>
                    <Button
                      onClick={handleCreateNewStartup}
                      disabled={isCreatingNewRecord}
                    >
                      {isCreatingNewRecord ? "Creating..." : "Create New Startup"}
                    </Button>
                  </div>
                ) : (
                  isDuplicationButtonVisible && ( 
                    <Button
                      onClick={handleCreateOrUpdateStartup}
                      disabled={!isFormValid || isCheckingDuplication || isDuplicateCheckPassed}
                      variant={"outline"}
                    >
                      {isCheckingDuplication ? "Checking for duplication!" : "Check for duplication!"}
                    </Button>
                  )
                )}
              </div>
              {/*Form 2*/}
              <div className={`grid grid-cols-3 gap-4 py-2 ${isForm2Disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <Label htmlFor="receivedDate">Received Date<span className="text-red-500">*</span></Label>
                  <Input
                    id="receivedDate"
                    type="date"
                    min={new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    value={editedProject.receivedDate}
                    onChange={(e) =>
                      setEditedProject({
                        ...editedProject!,
                        receivedDate: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div>
                  <Label htmlFor="services">Services<span className="text-red-500">*</span></Label>
                  <Select
                    value={editedProject.services}
                    onValueChange={(value) => {
                      setEditedProject({ ...editedProject!, services: value });
                      if (value !== "Other") {
                        setCustomService("");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Consulting", "BDD", "Investment Raise", "Other"
                      ].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editedProject.services === "Other" && (
                  <div>
                    <Label htmlFor="customService">Other Service<span className="text-red-500">*</span></Label>
                    <Input
                      id="customService"
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      placeholder="Enter custom service"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="client">Client{editedProject?.services === "BDD" && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="client"
                    value={editedProject.client || ""}
                    onChange={(e) =>
                      setEditedProject({
                        ...editedProject!,
                        client: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="projectTemplate">Project Template<span className="text-red-500">*</span></Label>
                  <Select
                    value={editedProject.projectTemplate}
                    onValueChange={(value) =>
                      setEditedProject({ ...editedProject!, projectTemplate: value,
                        stage: value === "TANSIM" ? "Pre First Connect" : ""
                       })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Others", "TANSIM"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {editedProject.projectTemplate === "TANSIM" && (
                  <div>
                    <Label htmlFor="stage">Stage</Label>
                    <Select
                      value={editedProject.stage}
                      onValueChange={(value) =>
                        setEditedProject({
                          ...editedProject!,
                          stage: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Pre First Connect",
                          "First Connect",
                          "SME",
                          "Deep Dive",
                          "IM",
                          "IC",
                          "PSC",
                          "SHA",
                        ].map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                </div>
                <div className="text-right">
              
                  {!isAddingNewProject && (
                    <Button
                      onClick={handleDeleteProject}
                      className="bg-white text-black border border-black hover:bg-neutral-200"
                    >
                      Delete
                    </Button>
                  )}
                  <Button onClick={handleConfirmChanges} disabled={isSubmitting}
                  className={(!editedProject?.startupId || !editedProject?.receivedDate || !editedProject?.projectTemplate || !editedProject?.services || (editedProject?.services === "BDD" && !editedProject?.client)) ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {isAddingNewProject ? "Add Project" : "Save"}
                    {isSubmitting && "..."}
                  </Button>
                </div>
            <DialogFooter>
              
            </DialogFooter>

          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default ProjectsPage;
