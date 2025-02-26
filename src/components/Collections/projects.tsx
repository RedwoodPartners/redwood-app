"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  STAGING_DATABASE_ID,
  PROJECTS_ID,
  STARTUP_ID
} from "@/appwrite/config";
import { databases } from "@/lib/utils";
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
  startupStatus: string;
  stage: string;
};

type Startup = {
  id: string;
  name: string;
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

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

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
      startupStatus: "",
      stage: "",
    });
    setIsAddingNewProject(true);
    setShowModal(true);
  };

  // Open edit dialog on double-tap
  const handleEditProject = (project: Project) => {
    setEditedProject(project);
    setIsAddingNewProject(false);
    setShowModal(true);
  };

 
  const handleConfirmChanges = async () => {
    if (isSubmitting) return; // Prevent duplicate submission
    setIsSubmitting(true);
    
    if (editedProject) {
      // Automatically set Project End Date if template is TANSIM
    if (editedProject.projectTemplate === "TANSIM" && editedProject.startDate) {
      editedProject.projectEndDate = calculateEndDate(editedProject.startDate);
    }
      // Generate `projectId`
      const generatedStartupId = nanoid(6)

      try {
        if (isAddingNewProject) {
          // Add a new project
          const response = await databases.createDocument(
            STAGING_DATABASE_ID,
            PROJECTS_ID,
            generatedStartupId,
            {
              name: editedProject.name,
              startupId: editedProject.startupId,
              startDate: editedProject.startDate,
              receivedDate: editedProject.receivedDate,
              projectEndDate: editedProject.projectEndDate,
              appliedFor: editedProject.appliedFor,
              services: editedProject.services,
              projectTemplate: editedProject.projectTemplate,
              startupStatus: editedProject.startupStatus,
              stage: editedProject.stage,
            }
          );
  
          setProjects((prev) => [
            ...prev,
            { ...editedProject, id: response.$id, startupId: generatedStartupId },
          ]);
  
          // Use the selected startup's ID for redirection
          const selectedStartup = startups.find(
            (startup) => startup.name === editedProject.name
          );
  
          if (selectedStartup) {
            router.push(`/projects/${response.$id}`); // Redirect to the new project
          } else {
            console.error("Startup not found for redirection.");
          }
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
              <TableHead>Start Date</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Project End Date</TableHead>
              <TableHead>Applied For?</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Project Template</TableHead>
              <TableHead>Startup Status</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              // Find the corresponding startup for the project
              const startup = startups.find((s) => s.name === project.name);
              return (
                <TableRow key={project.id} onDoubleClick={() => handleEditProject(project)}>
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
                  <TableCell>{formatDate(project.startDate)}</TableCell>
                  <TableCell>{formatDate(project.receivedDate)}</TableCell>
                  <TableCell>{formatDate(project.projectEndDate)}</TableCell>
                  <TableCell>{project.appliedFor}</TableCell>
                  <TableCell>{project.services}</TableCell>
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
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>
                {isAddingNewProject ? "Add New Project" : "Edit Project"}
              </DialogTitle>
              <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
              {errorMessage && (
                  <p className="text-red-500">{errorMessage}</p> // Display error message here
                )}
            </DialogHeader>

            {/* Form Fields */}
            <div className="grid grid-cols-3 gap-4 py-2">
            <div>
            <Label htmlFor="name">Startup Name</Label>
            <Select
              value={editedProject?.name || ""}
              onValueChange={(value) => {
              const selectedStartup = startups.find((startup) => startup.name === value);
              setEditedProject({
              ...editedProject!,
              name: value,
              startupId: selectedStartup ? selectedStartup.id : "", // Save startupId
              });
            }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a startup" />
              </SelectTrigger>
              <SelectContent>
                {/* Add Search Input */}
                <div className="p-2">
                  <Input
                    placeholder="Search startups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Render Filtered Startups */}
                {filteredStartups.map((startup) => (
                  <SelectItem key={startup.id} value={startup.name}>
                    {startup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editedProject.startDate}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject!,
                      startDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="receivedDate">Received Date</Label>
                <Input
                  id="receivedDate"
                  type="date"
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
                <Label htmlFor="projectEndDate">Project End Date</Label>
                <Input
                  id="projectEndDate"
                  type="date"
                  value={editedProject.projectEndDate}
                  onChange={(e) =>
                    setEditedProject({
                      ...editedProject!,
                      projectEndDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="appliedFor">Applied For?</Label>
                <Select
                  value={editedProject.appliedFor}
                  onValueChange={(value) =>
                    setEditedProject({ ...editedProject!, appliedFor: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Equity", "Grant", "Debt"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="services">Services</Label>
                <Select
                  value={editedProject.services}
                  onValueChange={(value) =>
                    setEditedProject({ ...editedProject!, services: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Consulting", "BDD", "Business Structuring", "Events"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="projectTemplate">Project Template</Label>
                <Select
                  value={editedProject.projectTemplate}
                  onValueChange={(value) =>
                    setEditedProject({ ...editedProject!, projectTemplate: value })
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

              <div>
                <Label htmlFor="startupStatus">Startup Status</Label>
                <Select
                  value={editedProject.startupStatus}
                  onValueChange={(value) =>
                    setEditedProject({
                      ...editedProject!,
                      startupStatus: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Pipeline",
                      "In-Progress",
                      "On-Hold",
                      "Non-Responsive",
                      "Backed out",
                      "Rejected",
                      "Completed",
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                      "Deep Dive",
                      "First Connect",
                      "Fund Release",
                      "IC",
                      "Pre First Connect",
                      "PSC",
                      "SME",
                    ].map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <DialogFooter>
              {!isAddingNewProject && (
                <Button
                  onClick={handleDeleteProject}
                  className="bg-white text-black border border-black hover:bg-neutral-200"
                >
                  Delete
                </Button>
              )}
              <Button onClick={handleConfirmChanges} disabled={isSubmitting}>
                {isAddingNewProject ? "Add Project" : "Save"}
                {isSubmitting && "..."}
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectsPage;
