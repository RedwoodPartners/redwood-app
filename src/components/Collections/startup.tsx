"use client";

import React, { useState } from "react";
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
  
  const columnDefs: ColDef<Startup>[] = [ 
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

  // Use the GridReadyEvent type for the params argument
  const onGridReady = (params: GridReadyEvent) => { 
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Startups</h1>

      {/* Add Startup Button */}
      <button
        onClick={handleAddStartup}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
      >
        Add New Startup
      </button>

      {/* Startups Grid */}
      <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={startups}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          domLayout='autoHeight'
          editType='fullRow' // Enable full row editing
        />
      </div>
    </div>
  );
};

export default StartupsPage;
