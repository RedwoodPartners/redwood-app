"use client";

import React, { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT, PROJECTS_ID } from "@/appwrite/config";
import { PlusCircle, Trash, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Project = {
  id: string;
  name: string;
  manager: string;
  startDate: string;
  endDate: string;
  description: string;
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchProjects = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PROJECTS_ID);
        const projectData = response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name || "",
          manager: doc.manager || "",
          startDate: doc.startDate || "",
          endDate: doc.endDate || "",
          description: doc.description || "",
        }));
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const newProject: Partial<Project> = {
      name: "",
      manager: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "",
    };

    try {
      const createdProject = await databases.createDocument(DATABASE_ID, PROJECTS_ID, "unique()", newProject);
      setProjects((prev) => [
        ...prev,
        {
          id: createdProject.$id,
          name: createdProject.name || "",
          manager: createdProject.manager || "",
          startDate: createdProject.startDate || "",
          endDate: createdProject.endDate || "",
          description: createdProject.description || "",
        },
      ]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditedProject(project);
    setShowModal(true);
  };

  const handleConfirmChanges = async () => {
    if (editedProject) {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        await databases.updateDocument(DATABASE_ID, PROJECTS_ID, editedProject.id, {
          name: editedProject.name,
          manager: editedProject.manager,
          startDate: editedProject.startDate,
          endDate: editedProject.endDate,
          description: editedProject.description,
        });

        setProjects((prev) =>
          prev.map((project) => (project.id === editedProject.id ? editedProject : project))
        );

        setEditedProject(null);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating project:", error);
      }
    }
  };

  const handleDiscardChanges = () => {
    setEditedProject(null);
    setShowModal(false);
  };

  const handleDeleteProject = async (id: string) => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    try {
      await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="p-2">
      <div className="flex space-x-3 mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={handleAddProject} variant="ghost" size="icon">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg border border-gray-300">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.manager}</TableCell>
              <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
              <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{project.description}</TableCell>
              <TableCell>
                <Button onClick={() => handleEditProject(project)} variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleDeleteProject(project.id)} variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editedProject && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="manager" className="text-right">
                  Manager
                </label>
                <Input
                  id="manager"
                  value={editedProject.manager}
                  onChange={(e) => setEditedProject({ ...editedProject, manager: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="startDate" className="text-right">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={editedProject.startDate}
                  onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="endDate" className="text-right">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={editedProject.endDate}
                  onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <Input
                  id="description"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleDiscardChanges} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleConfirmChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
