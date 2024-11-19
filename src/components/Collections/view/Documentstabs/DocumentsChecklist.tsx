"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, SaveIcon } from "lucide-react";
import { Query } from "appwrite";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

const DOC_CHECKLIST_ID = "673c200b000a415bbbad";

interface DocChecklistProps {
  startupId: string;
}

const DocumentChecklist: React.FC<DocChecklistProps> = ({ startupId }) => {
  const [docData, setdocData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newDoc, setNewDoc] = useState({
    docName: "",
    docType: "",
    status: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchPatentsData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, DOC_CHECKLIST_ID, [
          Query.equal("startupId", startupId),
        ]);
        setdocData(response.documents);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };

    fetchPatentsData();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedData = [...docData];
    updatedData[index][field] = value;
    setdocData(updatedData);
    setEditingIndex(index);
  };

  const handleSavePatents = async (index: number) => {
    const dataToUpdate = docData[index];
    const fieldsToUpdate = {
      docName: dataToUpdate.docName,
      docType: dataToUpdate.docType,
      status: dataToUpdate.status,
      description: dataToUpdate.description,
    };
  
    try {
      await databases.updateDocument(DATABASE_ID, DOC_CHECKLIST_ID, dataToUpdate.$id, fieldsToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving patents data:", error);
    }
  };
  

  const handleAddPatentsData = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        DOC_CHECKLIST_ID,
        "unique()",
        { ...newDoc, startupId }
      );
      setdocData([...docData, response]);
      setNewDoc({ docName: "", docType: "", status: "", description: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-lg font-bold mb-2 -mt-4 p-2">Document Checklist</h3>
      <Table>
        <TableCaption>Document checklist for submission and review</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Document Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docData.map((row, index) => (
            <TableRow key={row.$id}>
              <TableCell>
                <input
                  type="text"
                  value={row.docName}
                  onChange={(e) => handleEditChange(index, "docName", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.docType}
                  onChange={(e) => handleEditChange(index, "docType", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
  
              
              <TableCell>
                <input
                  type="text"
                  value={row.status}
                  onChange={(e) => handleEditChange(index, "status", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) => handleEditChange(index, "description", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {editingIndex === index && (
                  <button onClick={() => handleSavePatents(index)} className="text-black rounded-full transition">
                    <SaveIcon size={20} />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <input
                type="text"
                value={newDoc.docName}
                onChange={(e) => setNewDoc({ ...newDoc, docName: e.target.value })}
                placeholder="Document Name"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newDoc.docType}
                onChange={(e) => setNewDoc({ ...newDoc, docType: e.target.value })}
                placeholder="Document Type"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            
            <TableCell>
              <input
                type="text"
                value={newDoc.status}
                onChange={(e) => setNewDoc({ ...newDoc, status: e.target.value })}
                placeholder="Status"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newDoc.description}
                onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                placeholder="Description"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddPatentsData} className="text-black rounded-full transition">
                <PlusCircle size={20} />
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentChecklist;
