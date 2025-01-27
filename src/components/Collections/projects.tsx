"use client";

import React, { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";
import {
  DATABASE_ID,
  PROJECT_ID,
  API_ENDPOINT,
  PROJECTS_ID,
  STARTUP_ID
} from "@/appwrite/config";
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
import { PlusCircle } from "lucide-react";

type Project = {
  id: string;
  name: string;
  startDate: string;
  receivedDate: string;
  appliedFor: string;
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

  // Fetch projects on component mount
  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchProjects = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PROJECTS_ID);
        const projectData = response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name || "",
          startDate: doc.startDate || "",
          receivedDate: doc.receivedDate || "",
          appliedFor: doc.appliedFor || "",
          startupStatus: doc.startupStatus || "",
          stage: doc.stage || "",
        }));
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    // Fetch startups and initialize filteredStartups
    const fetchStartups = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
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
      startDate: "",
      receivedDate: "",
      appliedFor: "",
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

  // Save changes to the edited or new project
  const handleConfirmChanges = async () => {
    if (editedProject) {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        if (isAddingNewProject) {
          // Add a new project
          const response = await databases.createDocument(
            DATABASE_ID,
            PROJECTS_ID,
            "unique()",
            {
              name: editedProject.name,
              startDate: editedProject.startDate,
              receivedDate: editedProject.receivedDate,
              appliedFor: editedProject.appliedFor,
              startupStatus: editedProject.startupStatus,
              stage: editedProject.stage,
            }
          );

          setProjects((prev) => [
            ...prev,
            { ...editedProject, id: response.$id },
          ]);
        } else {
          // Update an existing project
          await databases.updateDocument(
            DATABASE_ID,
            PROJECTS_ID,
            editedProject.id,
            {
              name: editedProject.name,
              startDate: editedProject.startDate,
              receivedDate: editedProject.receivedDate,
              appliedFor: editedProject.appliedFor,
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
      } catch (error) {
        console.error("Error saving project:", error);
      }
    }
  };

  // Delete a project
  const handleDeleteProject = async () => {
    if (editedProject && !isAddingNewProject) {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, editedProject.id);
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

  return (
    <div className="p-2">
      <div className="flex space-x-3 mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <PlusCircle size={20} onClick={handleAddNewProject} className="cursor-pointer mt-2" />
      </div>
      <div className="bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Applied For?</TableHead>
              <TableHead>Startup Status</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                onDoubleClick={() => handleEditProject(project)}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  {new Date(project.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {project.receivedDate
                    ? new Date(project.receivedDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{project.appliedFor}</TableCell>
                <TableCell>{project.startupStatus}</TableCell>
                <TableCell>{project.stage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editedProject && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>
                {isAddingNewProject ? "Add New Project" : "Edit Project"}
              </DialogTitle>
              <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className="grid grid-cols-3 gap-4 py-2">
            <div>
            <Label htmlFor="name">Startup Name</Label>
            <Select
              value={editedProject?.name || ""}
              onValueChange={(value) =>
                setEditedProject({ ...editedProject!, name: value })
              }
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
              <Button onClick={handleConfirmChanges}>
                {isAddingNewProject ? "Add Project" : "Save"}
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectsPage;
