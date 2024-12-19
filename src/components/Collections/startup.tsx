"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent, RowEditingStoppedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ICellRendererParams } from 'ag-grid-community';
import { FaEye } from 'react-icons/fa';
import { PlusCircle, Trash } from "lucide-react";

import { Client, Databases, ID } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast"


type Startup = {
  id: string;
  name: string;
  brandName: string;
  businessType: string;
  natureOfCompany: string;
  subDomain: string;
  patents: string;
  dateOfIncorporation: string;
  registeredCompanyName: string;
  registeredState: string;
  incubated: string;
  registeredCountry: string;
  companyStage: string;
  domain: string;
  communityCertificate: string;
  revenue: string;
  employees: string;
  year: string;
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
  const router = useRouter();
  const { toast } = useToast();
  
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
          brandName: doc.brandName || "",
          businessType: doc.businessType || "",
          natureOfCompany: doc.natureOfCompany || "",
          subDomain: doc.subDomain || "",
          patents: doc.patents || "",
          dateOfIncorporation: doc.dateOfIncorporation || "",
          registeredCompanyName: doc.registeredCompanyName || "",
          registeredState: doc.registeredState || "",
          incubated: doc.incubated || "",
          registeredCountry: doc.registeredCountry || "",
          companyStage: doc.companyStage || "",
          domain: doc.domain || "",
          communityCertificate: doc.communityCertificate || "",
          revenue: doc.revenue || "",
          employees: doc.employees || "",
          year: doc.year || "",
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
    
    //generating 12 digit Id for Startups
    const generate12DigitId = () => {
      return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    };

    const newStartup: Partial<Startup> = {
      name: "",
      brandName: "",
      businessType: "",
      natureOfCompany: "",
      subDomain: "",
      patents: "Yes/No",
      dateOfIncorporation: "",
      registeredCompanyName: "",
      registeredState: "",
      incubated: "Yes/No",
      registeredCountry: "",
      companyStage: "",
      domain: "",
      communityCertificate: "Yes/No",
      revenue: "",
      employees: "",
      year: "",
      description: "",
    };
    const customId = generate12DigitId();
    try {
      const createdStartup = await databases.createDocument(DATABASE_ID, STARTUP_ID, customId, newStartup);
      setStartups((prev) => [
        ...prev,
        { 
          id: createdStartup.$id,
          name: createdStartup.name || "",
          brandName: createdStartup.brandName || "",
          businessType: createdStartup.businessType || "",
          natureOfCompany: createdStartup.natureOfCompany || "",
          subDomain: createdStartup.subDomain || "",
          patents: createdStartup.patents || "",
          dateOfIncorporation: createdStartup.dateOfIncorporation || "",
          registeredCompanyName: createdStartup.registeredCompanyName || "",
          registeredState: createdStartup.registeredState || "",
          incubated: createdStartup.incubated || "",
          registeredCountry: createdStartup.registeredCountry || "",
          companyStage: createdStartup.companyStage || "",
          domain: createdStartup.domain || "",
          communityCertificate: createdStartup.communityCertificate || "",
          revenue: createdStartup.revenue || "",
          employees: createdStartup.employees || "",
          year: createdStartup.year || "",
          description: createdStartup.description || "", },
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
        //Update the edited startup in Appwrite
        await databases.updateDocument(DATABASE_ID, STARTUP_ID, editedRow.id,{
          name: editedRow.name,
          brandName: editedRow.brandName,
          businessType: editedRow.businessType,
          natureOfCompany:editedRow.natureOfCompany,
          subDomain: editedRow.subDomain,
          patents: editedRow.patents,
          dateOfIncorporation: editedRow.dateOfIncorporation,
          registeredCompanyName: editedRow.registeredCompanyName,
          registeredState: editedRow.registeredState,
          incubated: editedRow.incubated,
          registeredCountry: editedRow.registeredCountry,
          companyStage: editedRow.companyStage,
          domain: editedRow.domain,
          communityCertificate: editedRow.communityCertificate,
          revenue: editedRow.revenue,
          employees: editedRow.employees,
          year: editedRow.year,
          description: editedRow.description,

        });
        //reflect the updated data
        setStartups((prev) =>
          prev.map((startup) =>
            startup.id === editedRow.id ? editedRow : startup
          )
        );
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

    //Re-fetch data from the database to revert changes
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    try{
      const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
      const startupData = response.documents.map((doc: Document) => ({
        id:doc.$id,
        name: doc.name || "",
        brandName: doc.brandName || "",
        businessType: doc.businessType || "",
        natureOfCompany: doc.natureOfCompany || "",
        subDomain: doc.subDomain || "",
        patents: doc.patents || "",
        dateOfIncorporation: doc.dateOfIncorporation || "",
        registeredCompanyName: doc.registeredCompanyName || "",
        registeredState: doc.registeredState || "",
        incubated: doc.incubated || "",
        registeredCountry: doc.registeredCountry || "",
        companyStage: doc.companyStage || "",
        domain: doc.domain || "",
        communityCertificate: doc.communityCertificate || "",
        revenue: doc.revenue || "",
        employees: doc.employees || "",
        year: doc.year || "",
        description: doc.description || "",
        
      }));
      setStartups(startupData);
    }catch(error){
      console.error("Error fetching Startups:",error);
    }

  };

  const handleViewStartup = (id: string) => {
    console.log("View Startup ID:", id);
    router.push(`/startup/${id}`);
  };

  const columnDefs: ColDef<Startup>[] = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    {
      headerName: "View",
      cellRenderer: (params: ICellRendererParams<Startup>) => (
        <button onClick={() => {
            if (params.data) {
              handleViewStartup(params.data.id);
            }
          }}
          className="bg-transparent text-gray-600 hover:text-blue-700 px-2 py-1 border border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50"
          title="View Startup"
          disabled={!params.data}
        >
         <FaEye size={18} />
        </button>
      ),
      width: 70,
      cellClass: "justify-center",
    },
    { field: "id", headerName: "ID", sortable: true, filter: true, width: 130},
    { field: "name", headerName: "Startup Name", sortable: true, filter: true, editable: true, width: 200 },
    { field: "brandName", headerName: "Brand Name", sortable: true, filter: true, editable: true, width: 200 },
    { field: "businessType", headerName: "Business Type", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "natureOfCompany", headerName: "Nature of Company", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "subDomain", headerName: "Sub Domain", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "patents", headerName: "Patents & Certifications", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "dateOfIncorporation", headerName: "Date of Incorporation", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "registeredCompanyName", headerName: "Registered Company Name", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "incubated", headerName: "Incubated?", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "registeredState", headerName: "Registered State", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "registeredCountry", headerName: "Registered Country", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "companyStage", headerName: "Company Stage", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "domain", headerName: "Domain", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "communityCertificate", headerName: "Community Certificate?", sortable: true, filter: true, editable: true, width: 150 },
    //{ field: "employees", headerName: "Employees", sortable: true, filter: true, editable: true, width: 150 },
    { field: "revenue", headerName: "Revenue(last FY)", sortable: true, filter: true, editable: true, width: 200 },
    { field: "year", headerName: "Year", sortable: true, filter: true, editable: true, width: 150 },
    { field: "description", headerName: "Description", sortable: true, filter: true, editable: true, width: 200 },
  ];

  return (
    <div className="p-2 mx-auto">
      <div className="flex space-x-3">
        <h1 className="text-2xl font-semibold">Startups</h1>
        <button onClick={handleAddStartup} className="text-black rounded-full transition hover:text-green-500 focus:outline-none"
        ><PlusCircle size={20} 
          onClick={() => {
          toast({
            title: "Startup added Sucessfully!",
            description: "12 Digit ID generated",
          })
        }} />
        </button>
        <button onClick={handleRemoveSelected} className="text-black rounded-full transition hover:text-red-500 focus:outline-none" >
          <Trash size={20} 
          onClick={() => {
            toast({
              variant: "destructive",
              title: "Startup Removed",
            })
          }} 
          /></button>
      </div>

      <div className="ag-theme-quartz font-medium mt-3 mx-auto" style={{ height: 600, width: '100%'}}>
        <AgGridReact headerHeight={40}
          ref={gridRef}
          rowData={startups}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={false}
          paginationPageSize={20}
          domLayout='normal'
          editType="fullRow"
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
