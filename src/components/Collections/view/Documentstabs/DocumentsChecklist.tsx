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
import { PlusCircle, SaveIcon, UploadCloud, Download } from "lucide-react";
import { Query, ID, Client, Databases, Storage } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

const DOC_CHECKLIST_ID = "673c200b000a415bbbad";
const BUCKET_ID = "66eb0cfc000e821db4d9";

interface DocChecklistProps {
  startupId: string;
}

const DocumentChecklist: React.FC<DocChecklistProps> = ({ startupId }) => {
  const [docData, setDocData] = useState<any[]>([]);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [newDoc, setNewDoc] = useState({
    docName: "",
    docType: "",
    status: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);
  const storage = new Storage(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);
    const fetchDocuments = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, DOC_CHECKLIST_ID, [
          Query.equal("startupId", startupId),
        ]);
        setDocData(response.documents);
      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };

    fetchDocuments();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedData = [...docData];
    updatedData[index][field] = value;
    setDocData(updatedData);

    const updatedChangedRows = new Set(changedRows);
    updatedChangedRows.add(index);
    setChangedRows(updatedChangedRows);
  };

  const handleSaveDocument = async (index: number) => {
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

      // Remove the index from changed rows after saving
      const updatedChangedRows = new Set(changedRows);
      updatedChangedRows.delete(index);
      setChangedRows(updatedChangedRows);
    } catch (error) {
      console.error("Error saving document data:", error);
    }
  };

  const handleUploadFile = async (index: number, file: File) => {
    const documentId = docData[index].$id;

    try {
      const uploadResponse = await storage.createFile(BUCKET_ID, ID.unique(), file);
      console.log("File uploaded successfully:", uploadResponse);
      alert("File uploaded successfully");

      await databases.updateDocument(DATABASE_ID, DOC_CHECKLIST_ID, documentId, {
        fileId: uploadResponse.$id,
      });

      const updatedData = [...docData];
      updatedData[index] = {
        ...updatedData[index],
        fileId: uploadResponse.$id,
      };
      setDocData(updatedData);
      console.log("File link updated in database");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleAddDocument = async () => {
    try {
      const response = await databases.createDocument(DATABASE_ID, DOC_CHECKLIST_ID, ID.unique(), {
        ...newDoc,
        startupId,
      });
      setDocData([...docData, response]);
      setNewDoc({ docName: "", docType: "", status: "", description: "" });
    } catch (error) {
      console.error("Error adding document data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Document Checklist</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>Document checklist for submission and review</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
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
              <div className="flex items-center justify-start space-x-2">
                {row.fileId ? (
                  <a
                    href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${row.fileId}/download?project=${PROJECT_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    <Download size={20} className="inline" />
                  </a>
                ) : null}
                {changedRows.has(index) ? (
                  <button
                    onClick={() => handleSaveDocument(index)}
                    className="text-black rounded-full transition ml-2"
                  >
                    <SaveIcon size={20} />
                  </button>
                ) : null}
                <label className="ml-2">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadFile(index, file);
                    }}
                  />
                  <UploadCloud size={20} className="cursor-pointer" />
                </label>
                </div>
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
              <button onClick={handleAddDocument} className="text-black rounded-full transition">
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
