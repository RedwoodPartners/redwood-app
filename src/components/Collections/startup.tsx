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
import { Client, Databases } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const gridRef = useRef<AgGridReact<Startup>>(null);
  const router = useRouter();
  const { toast } = useToast();

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

  const handleAddStartup = () => {
    setShowAddDialog(true);
  };

  const createAndRedirect = async (newStartupData: Partial<Startup>) => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
  
    // Removes spaces from brandName and generate custom ID
    const formattedBrandName = newStartupData.brandName?.replace(/\s+/g, '') || '';
    const customId = `${formattedBrandName}-${Math.floor(1000 + Math.random() * 9000)}`;
  
    try {
      const createdStartup = await databases.createDocument(DATABASE_ID, STARTUP_ID, customId, newStartupData);
      setShowAddDialog(false);
      router.push(`/startup/${createdStartup.$id}`);
    } catch (error) {
      console.error("Error adding startup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create startup. Please try again.",
      });
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
        await databases.updateDocument(DATABASE_ID, STARTUP_ID, editedRow.id, editedRow);
        setStartups((prev) =>
          prev.map((startup) => (startup.id === editedRow.id ? editedRow : startup))
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
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
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
      console.error("Error fetching Startups:", error);
    }
  };

  const handleViewStartup = (id: string) => {
    router.push(`/startup/${id}`);
  };

  const columnDefs: ColDef<Startup>[] = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    {
      headerName: "View",
      cellRenderer: (params: ICellRendererParams<Startup>) => (
        <button
          onClick={() => {
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
    { field: "id", headerName: "ID", sortable: true, filter: true, width: 130 },
    { field: "name", headerName: "Startup Name", sortable: true, filter: true, editable: true, width: 200 },
    { field: "brandName", headerName: "Brand Name", sortable: true, filter: true, editable: true, width: 200 },
    { field: "revenue", headerName: "Revenue(last FY)", sortable: true, filter: true, editable: true, width: 200 },
    { field: "year", headerName: "Year", sortable: true, filter: true, editable: true, width: 150 },
    { field: "description", headerName: "Description", sortable: true, filter: true, editable: true, width: 200 },
  ];

  return (
    <div className="p-2 mx-auto">
      <div className="flex space-x-3">
        <h1 className="text-2xl font-semibold">Startups</h1>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-black rounded-full transition hover:text-green-500 focus:outline-none">
              <div className="relative group">
                <PlusCircle size={20} />
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap">
                  Add new Startup
                </span>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Add New Startup</DialogTitle>
              <DialogDescription className="text-sm" >
                Fill in the details to add a new startup.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newStartupData = Object.fromEntries(formData.entries());
              createAndRedirect(newStartupData as Partial<Startup>);
            }}>
              <Input
                type="text"
                name="name"
                placeholder="Startup Name"
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <Input
                type="text"
                name="brandName"
                placeholder="Brand Name"
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <Input
                type="text"
                name="year"
                placeholder="Year"
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <Textarea
                name="description"
                placeholder="Description"
                className="w-full p-2 mb-2 border rounded"
                rows={3}
              ></Textarea>
              <div className="flex justify-end mt-4">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <button
          onClick={handleRemoveSelected}
          className="text-black rounded-full transition hover:text-red-500 focus:outline-none"
        >
          <div className="relative group">
            <Trash size={20} />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap">
              Remove selected Startup
            </span>
          </div>
        </button>
      </div>
      <div
        className="ag-theme-quartz font-medium mt-3 mx-auto"
        style={{ height: 600, width: '100%' }}
      >
        <AgGridReact
          headerHeight={40}
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
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Do you want to save changes?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleConfirmChanges} className="mr-2">Yes</Button>
            <Button onClick={handleDiscardChanges} variant="outline">No</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartupsPage;
