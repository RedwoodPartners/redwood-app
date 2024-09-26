"use client";

import React, { useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react"; 
import { ColDef, GridReadyEvent } from "ag-grid-community"; 
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"; 

type Startup = {
  id: string;
  name: string;
  status: string;
  founded: string; 
  description: string;
};

const StartupsPage: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const gridRef = useRef<AgGridReact<Startup>>(null); // Create a ref for AgGridReact

  const columnDefs: ColDef<Startup>[] = [ 
    { headerCheckboxSelection: true, checkboxSelection: true }, // Enable checkbox for row selection
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "name", headerName: "Name", sortable: true, filter: true, editable: true },
    { field: "status", headerName: "Status", sortable: true, filter: true, editable: true },
    {
      field: "founded",
      headerName: "Founded",
      sortable: true,
      filter: true,
      editable: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    { field: "description", headerName: "Description", sortable: true, filter: true, editable: true },
  ];

  // Add New Startup
  const handleAddStartup = () => {
    const newStartup: Startup = {
      id: `${startups.length + 1}`, // Mock ID generation
      name: "",
      status: "",
      founded: new Date().toISOString().split("T")[0], // Default to today's date
      description: "",
    };
    setStartups((prev) => [...prev, newStartup]);
  };

  // Remove Selected Startups
  const handleRemoveSelected = () => {
    const gridApi = gridRef.current?.api; // Access the grid API using the ref
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedNodes();
      const selectedIds = selectedNodes
        .map(node => node.data) // Get the node data
        .filter(data => data !== undefined) // Filter out any undefined data
        .map(data => data.id); // Now safely access the ID
      
      setStartups((prev) => prev.filter(startup => !selectedIds.includes(startup.id)));
    }
  };

  // Use the GridReadyEvent type for the params argument
  const onGridReady = (params: GridReadyEvent) => { 
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Startups</h1>

      {/* Add Startup Button */}
      <button onClick={handleAddStartup}
        className="bg-gray-100 text-gray-800 text-sm py-2 px-4 mb-3 rounded hover:bg-gray-200 transition duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Add Startup
      </button>

      {/* Remove Selected Button with Updated Style */}
      <button onClick={handleRemoveSelected}
        className="bg-gray-100 text-gray-800 text-sm py-2 px-2 mb-3 ml-3 rounded hover:bg-gray-200 transition duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Remove Selected
      </button>

      {/* Startups Grid */}
      <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          ref={gridRef} // Attach the ref to AgGridReact
          rowData={startups}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          domLayout='autoHeight'
          editType='fullRow' // Enable full row editing
          rowSelection="multiple" // Enable multiple row selection
        />
      </div>
    </div>
  );
};

export default StartupsPage;
