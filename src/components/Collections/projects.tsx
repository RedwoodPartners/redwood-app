"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent, RowEditingStoppedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT, PROJECTS_ID } from "@/appwrite/config";

import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
  manager: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Document = {
  $id: string;
  [key: string]: any;
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editedRow, setEditedRow] = useState<Project | null>(null);
  const gridRef = useRef<AgGridReact<Project>>(null);

  // Initialize Appwrite client and fetch projects only on the client side
  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchProjects = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PROJECTS_ID);
        const projectData = response.documents.map((doc: Document) => ({
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
      name: "New Project",
      manager: "Manager Name",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "Project Description",
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

  const handleRemoveSelected = async () => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const gridApi = gridRef.current?.api;
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedNodes();
      const selectedIds = selectedNodes
        .map((node) => node.data?.id) 
        .filter((id): id is string => id !== undefined);

      try {
        await Promise.all(
          selectedIds.map((id) => databases.deleteDocument(DATABASE_ID, PROJECTS_ID, id))
        );
        setProjects((prev) => prev.filter((project) => !selectedIds.includes(project.id)));
      } catch (error) {
        console.error("Error deleting projects:", error);
      }
    }
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onRowEditingStopped = (event: RowEditingStoppedEvent) => {
    const updatedRow = event.data as Project;
    setEditedRow(updatedRow);
    setShowModal(true);
  };

  const handleConfirmChanges = async () => {
    if (editedRow) {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        // Update the edited project in Appwrite
        await databases.updateDocument(DATABASE_ID, PROJECTS_ID, editedRow.id, {
          name: editedRow.name,
          manager: editedRow.manager,
          startDate: editedRow.startDate,
          endDate: editedRow.endDate,
          description: editedRow.description,
        });

        // Reflect the updated data in the UI
        setProjects((prev) =>
          prev.map((project) =>
            project.id === editedRow.id ? editedRow : project
          )
        );

        // Clear edited row state
        setEditedRow(null);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating project:", error);
      }
    }
  };

  const handleDiscardChanges = async () => {
    setEditedRow(null);
    setShowModal(false);
    
    // Re-fetch data from the database to revert changes
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    try {
      const response = await databases.listDocuments(DATABASE_ID, PROJECTS_ID);
      const projectData = response.documents.map((doc: Document) => ({
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

  const columnDefs: ColDef<Project>[] = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "name", headerName: "Name", sortable: true, filter: true, editable: true },
    { field: "manager", headerName: "Manager", sortable: true, filter: true, editable: true },
    {
      field: "startDate",
      headerName: "Start Date",
      sortable: true,
      filter: true,
      editable: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "endDate",
      headerName: "End Date",
      sortable: true,
      filter: true,
      editable: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    { field: "description", headerName: "Description", sortable: true, filter: true, editable: true },
  ];

  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>
      <Button onClick={handleAddProject} className="mx-auto" variant="secondary">Add Project</Button>
      <Button onClick={handleRemoveSelected} className="mx-auto ml-3" variant="secondary">Remove Selected</Button>
      <div className="ag-theme-quartz mt-3" style={{ height: 500, width: '100%'}}>
        <AgGridReact
          ref={gridRef}
          rowData={projects}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={20}
          domLayout='normal'
          editType='fullRow'
          onRowEditingStopped={onRowEditingStopped}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Changes</h2>
            <p className="mb-4">Do you want to save changes?</p>
            <div className="flex justify-end">
              <button
                onClick={handleConfirmChanges}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
              >
                Yes
              </button>
              <button
                onClick={handleDiscardChanges}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
