"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent, RowEditingStoppedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ICellRendererParams } from 'ag-grid-community';

import { Client, Databases, ID } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

type Startup = {
  id: string;
  name: string;
  status: string;
  founded: string;
  description: string;
};

type Document = {
  $id: string;
  [key: string]: any;
};

const StartupsPage: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editedRow, setEditedRow] = useState<Startup | null>(null);
  const gridRef = useRef<AgGridReact<Startup>>(null);

  // Initialize Appwrite client and fetch startups only on the client side
  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchStartups = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
        const startupData = response.documents.map((doc: Document) => ({
          id: doc.$id,
          name: doc.name || "",
          status: doc.status || "",
          founded: doc.founded || "",
          description: doc.description || "",
        }));
        setStartups(startupData);
      } catch (error) {
        console.error("Error fetching startups:", error);
      }
    };

    fetchStartups();
  }, []);

  const handleAddStartup = async () => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const newStartup: Partial<Startup> = {
      name: "New Startup",
      status: "Active",
      founded: new Date().toISOString().split("T")[0],
      description: "Description",
    };
    try {
      const createdStartup = await databases.createDocument(DATABASE_ID, STARTUP_ID, "unique()", newStartup);
      setStartups((prev) => [
        ...prev,
        {
          id: createdStartup.$id,
          name: createdStartup.name || "",
          status: createdStartup.status || "",
          founded: createdStartup.founded || "",
          description: createdStartup.description || "",
        },
      ]);
    } catch (error) {
      console.error("Error adding startup:", error);
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
          selectedIds.map((id) => databases.deleteDocument(DATABASE_ID, STARTUP_ID, id))
        );
        setStartups((prev) => prev.filter((startup) => !selectedIds.includes(startup.id)));
      } catch (error) {
        console.error("Error deleting startups:", error);
      }
    }
  };
  
  
  
  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onRowEditingStopped = (event: RowEditingStoppedEvent) => {
    const updatedRow = event.data as Startup;
    setEditedRow(updatedRow);
    setShowModal(true);
  };

  const handleConfirmChanges = async () => {
    if (editedRow) {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);
  
      try {
        // Update the edited startup in Appwrite
        await databases.updateDocument(DATABASE_ID, STARTUP_ID, editedRow.id, {
          name: editedRow.name,
          status: editedRow.status,
          founded: editedRow.founded,
          description: editedRow.description,
        });
  
        // Reflect the updated data in the UI
        setStartups((prev) =>
          prev.map((startup) =>
            startup.id === editedRow.id ? editedRow : startup
          )
        );
  
        // Clear edited row state
        setEditedRow(null);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating startup:", error);
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
      const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
      const startupData = response.documents.map((doc: Document) => ({
        id: doc.$id,
        name: doc.name || "",
        status: doc.status || "",
        founded: doc.founded || "",
        description: doc.description || "",
      }));
      setStartups(startupData);
    } catch (error) {
      console.error("Error fetching startups:", error);
    }
  };

  const handleViewStartup = (id: string) => {
  console.log("View Startup ID:", id);
  // navigate(`/startups/${id}`);
  };

  

  const columnDefs: ColDef<Startup>[] = [
    { headerCheckboxSelection: true, checkboxSelection: true },
    {
      headerName: "View",
      cellRenderer: (params: ICellRendererParams<Startup>) => (
        <button
          onClick={() => {
            if (params.data) {
              handleViewStartup(params.data.id);
            }
          }}
          className="text-blue-500 hover:text-blue-700"
          title="View Startup"
          disabled={!params.data} // Disable button if no data
        >
          👁️
        </button>
      ),
      width: 100,
      cellClass: "justify-center",
    },
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


  return (
    <div className="container mx-auto p-16 -mt-10">
      <h1 className="text-2xl font-semibold mb-4">Startups</h1>
      <button
        onClick={handleAddStartup}
        className="bg-gray-100 text-gray-800 text-sm py-2 px-4 mb-3 rounded hover:bg-gray-200 transition duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Add Startup
      </button>
      <button
        onClick={handleRemoveSelected}
        className="bg-gray-100 text-gray-800 text-sm py-2 px-2 mb-3 ml-3 rounded hover:bg-gray-200 transition duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        Remove Selected
      </button>
      <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={startups}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          domLayout='autoHeight'
          editType='fullRow'
          rowSelection="multiple"
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
   
export default StartupsPage;
