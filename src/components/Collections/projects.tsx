"use client";

import React, { useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react"; 
import { ColDef, GridReadyEvent, RowEditingStoppedEvent } from "ag-grid-community"; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"; 

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
  const [editedRow, setEditedRow] = useState<Project | null>(null); // Track the edited row
  const [tempProjects, setTempProjects] = useState<Project[]>([]); // Temporary state to store changes
  const gridRef = useRef<AgGridReact<Project>>(null);

  const columnDefs: ColDef<Project>[] = [ 
    { headerCheckboxSelection: true, checkboxSelection: true }, // Enable checkbox for row selection
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

  // Add New Project
  const handleAddProject = () => {
    const newProject: Project = {
      id: `${projects.length + 1}`, // Mock ID generation
      name: "",
      manager: "",
      startDate: new Date().toISOString().split("T")[0], // Default to today's date
      endDate: "",
      description: "",
    };
    setProjects((prev) => [...prev, newProject]);
  };

  // Remove Selected Projects
  const handleRemoveSelected = () => {
    const gridApi = gridRef.current?.api;
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedNodes();
      const selectedIds = selectedNodes
        .map(node => node.data)
        .filter(data => data !== undefined)
        .map(data => data.id);
      
      setProjects((prev) => prev.filter(project => !selectedIds.includes(project.id)));
    }
  };

  // Use the GridReadyEvent type for the params argument
  const onGridReady = (params: GridReadyEvent) => { 
    params.api.sizeColumnsToFit();
  };

  // Handle the changes after row editing
  const onRowEditingStopped = (event: RowEditingStoppedEvent) => {
    const updatedRow = event.data as Project;
    setEditedRow(updatedRow); // Save the edited row
    setTempProjects([...projects]); // Save temporary changes
    setShowModal(true); // Show confirmation modal
  };

  // Confirm Changes for the edited row
  const handleConfirmChanges = () => {
    if (editedRow) {
      setProjects((prev) => 
        prev.map((project) => 
          project.id === editedRow.id ? editedRow : project
        )
      );
      setEditedRow(null); // Clear edited row
    }
    setShowModal(false); // Close modal
  };

  // Discard Changes for the edited row
  const handleDiscardChanges = () => {
    if (editedRow) {
      setProjects(tempProjects); // Revert to original state using tempProjects
      setEditedRow(null); // Clear edited row
      gridRef.current?.api.refreshCells(); // Refresh the grid to original state
    }
    setShowModal(false); // Close modal
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>

      {/* Add Project Button */}
      <button onClick={handleAddProject}
        className="bg-gray-100 text-gray-800 text-sm py-2 px-4 mb-3 rounded hover:bg-gray-200 transition duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Add Project
      </button>

      {/* Remove Selected Button */}
      <button onClick={handleRemoveSelected}
        className="bg-gray-100 text-gray-800 text-sm py-2 px-2 mb-3 ml-3 rounded hover:bg-gray-200 transition duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Remove Selected
      </button>

      {/* Projects Grid */}
      <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={projects}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          domLayout='autoHeight'
          editType='fullRow'
          rowSelection="multiple"
          onRowEditingStopped={onRowEditingStopped} // Capture editing events
        />
      </div>

      {/* Confirmation Modal */}
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
