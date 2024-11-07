"use client";

import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellEditorParams, RowEditingStoppedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, STARTUP_ID, API_ENDPOINT } from "@/appwrite/config";
import { Button } from "@/components/ui/button";

export const CONTACT_ID = "672bac4a0017528d75ae";

type Contact = {
  id: string;
  startup: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyWebsite: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
};

type Startup = {
  id: string;
  name: string;
};

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editedRow, setEditedRow] = useState<Contact | null>(null);
  const gridRef = useRef<AgGridReact<Contact>>(null);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchContacts = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, CONTACT_ID);
        const contactData = response.documents.map((doc) => ({
          id: doc.$id,
          startup: doc.startup || "",
          firstName: doc.firstName || "",
          lastName: doc.lastName || "",
          email: doc.email || "",
          phone: doc.phone || "",
          companyWebsite: doc.companyWebsite || "",
          addressLine1: doc.addressLine1 || "",
          addressLine2: doc.addressLine2 || "",
          city: doc.city || "",
          state: doc.state || "",
        }));
        setContacts(contactData);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    const fetchStartups = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
        const startupData = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.name,
        }));
        setStartups(startupData);
      } catch (error) {
        console.error("Error fetching startups:", error);
      }
    };

    fetchContacts();
    fetchStartups();
  }, []);

  const handleAddContact = async () => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
  
    const newContact: Contact = {
      id: Date.now().toString(),
      startup: "select Startup ↓",
      firstName: "",
      lastName: "",
      email: "name@example.com",
      phone: "",
      companyWebsite: "https://#",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
    };
  
    try {
      const response = await databases.createDocument(
        DATABASE_ID, 
        CONTACT_ID,            
        "unique()",            
        {
          startup: newContact.startup,
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email,
          phone: newContact.phone,
          companyWebsite: newContact.companyWebsite,
        }                   
      );
      const contactWithRealId = {
        ...newContact,
        id: response.$id,
      };
  
      //applyTransaction to add the new row to the grid
      gridRef.current?.api.applyTransaction({ add: [contactWithRealId] });
  
      // Update the contacts state with the new contact
      setContacts((prevContacts) => [...prevContacts, contactWithRealId]);
  
    } catch (error) {
      console.error("Error saving new contact:", error);
    }
  };

  const onRowEditingStopped = (event: RowEditingStoppedEvent) => {
    const updatedRow = event.data as Contact;
    setEditedRow(updatedRow);
    setShowModal(true);
  };

  const handleConfirmChanges = async () => {
    if (editedRow) {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        // Update the edited contact in Appwrite
        await databases.updateDocument(DATABASE_ID, CONTACT_ID, editedRow.id, {
          startup: editedRow.startup,
          firstName: editedRow.firstName,
          lastName: editedRow.lastName,
          email: editedRow.email,
          phone: editedRow.phone,
          companyWebsite: editedRow.companyWebsite,
          addressLine1: editedRow.addressLine1,
          addressLine2: editedRow.addressLine2,
          city: editedRow.city,
          state: editedRow.state,
        });
        // Update the contacts state to reflect the changes
        setContacts((prev) =>
          prev.map((contact) => (contact.id === editedRow.id ? editedRow : contact))
        );
        setEditedRow(null);
        setShowModal(false);
      } catch (error) {
        console.error("Error updating contact:", error);
      }
    }
  };

  const handleDiscardChanges = async () => {
    setEditedRow(null);
    setShowModal(false);
    // Optionally re-fetch contacts to revert changes
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    try {
      const response = await databases.listDocuments(DATABASE_ID, CONTACT_ID);
      const contactData = response.documents.map((doc) => ({
        id: doc.$id,
        startup: doc.startup || "",
        firstName: doc.firstName || "",
        lastName: doc.lastName || "",
        email: doc.email || "",
        phone: doc.phone || "",
        companyWebsite: doc.companyWebsite || "",
        addressLine1: doc.addressLine1 || "",
        addressLine2: doc.addressLine2 || "",
        city: doc.city || "",
        state: doc.state || "",
      }));
      setContacts(contactData);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Show confirmation modal before saving
  const handleSaveRow = (row: Contact) => {
    setEditedRow(row);
    setShowModal(true);
  };

  const columnDefs: ColDef<Contact>[] = [
    {
      field: "startup",
      headerName: "Startup",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: (params: ICellEditorParams) => {
        return {
          values: startups.map((startup) => startup.id),
        };
      },
      valueFormatter: (params) => {
        const startup = startups.find((s) => s.id === params.value);
        return startup ? startup.name : params.value;
      },
      width: 200,
    },
    { field: "firstName", headerName: "First Name", sortable: true, filter: true, editable: true, width: 150 },
    { field: "lastName", headerName: "Last Name", sortable: true, filter: true, editable: true, width: 150 },
    { field: "email", headerName: "Email", sortable: true, filter: true, editable: true, width: 210 },
    { field: "phone", headerName: "Phone", sortable: true, filter: true, editable: true, width: 150 },
    { field: "companyWebsite", headerName: "Company Website", sortable: true, filter: true, editable: true, width: 200 },
    { field: "addressLine1", headerName: "Address Line 1", sortable: true, filter: true, editable: true, width: 150 },
    { field: "addressLine2", headerName: "Address Line 2", sortable: true, filter: true, editable: true, width: 150 },
    { field: "city", headerName: "City", sortable: true, filter: true, editable: true, width: 150 },
    { field: "state", headerName: "State", sortable: true, filter: true, editable: true, width: 150 },
  ];

  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold mb-4">Contacts</h1>
      <Button onClick={handleAddContact} className="mx-auto mb-3" variant="secondary">
        Add Contact
      </Button>
      <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={contacts}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
          domLayout="normal"
          editType="fullRow"
          onRowEditingStopped={onRowEditingStopped}
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

export default ContactsPage;
