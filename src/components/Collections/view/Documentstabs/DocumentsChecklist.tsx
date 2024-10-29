"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditIcon, SaveIcon, PlusCircle } from "lucide-react";

const DocumentChecklist: React.FC = () => {
  const [documents, setDocuments] = useState([
    {
      name: "Bank Statements",
      type: "Financial",
      status: "Pending",
      description: "Mention any important information or deadline for submission.",
      isEditing: false,
    },
  ]);

  // Handle adding a new document row
  const addDocument = () => {
    const newDocument = {
      name: "New Document",
      type: "General",
      status: "Pending",
      description: "Enter details here.",
      isEditing: true, // New document starts in edit mode
    };
    setDocuments([...documents, newDocument]);
  };

  // Toggle edit mode for a document row
  const toggleEdit = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].isEditing = !updatedDocuments[index].isEditing;
    setDocuments(updatedDocuments);
  };

  // Save changes to the document
  const saveDocument = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].isEditing = false;
    setDocuments(updatedDocuments);
  };

  // Update document field values
  const handleFieldChange = (index: number, field: string, value: string) => {
    const updatedDocuments = [...documents];
    (updatedDocuments[index] as any)[field] = value;
    setDocuments(updatedDocuments);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Document Checklist</h3>
        <button
          onClick={addDocument}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <PlusCircle size={20} className="mr-1" />
          Add Document
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full bg-white border border-gray-300">
          <TableCaption>Document checklist for submission and review</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2 px-4 font-semibold text-gray-700">Document Name</TableHead>
              <TableHead className="py-2 px-4 font-semibold text-gray-700">Document Type</TableHead>
              <TableHead className="py-2 px-4 font-semibold text-gray-700">Status</TableHead>
              <TableHead className="py-2 px-4 font-semibold text-gray-700">Description</TableHead>
              <TableHead className="py-2 px-4 font-semibold text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={index}>
                <TableCell className="py-2 px-4 text-gray-600">
                  {doc.isEditing ? (
                    <input
                      value={doc.name}
                      onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    doc.name
                  )}
                </TableCell>
                <TableCell className="py-2 px-4 text-center">
                  {doc.isEditing ? (
                    <input
                      value={doc.type}
                      onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                      {doc.type}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-2 px-4 text-center">
                  {doc.isEditing ? (
                    <input
                      value={doc.status}
                      onChange={(e) => handleFieldChange(index, "status", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    <span className="bg-orange-100 text-orange-800 py-1 px-3 rounded-full">
                      {doc.status}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-2 px-4 text-gray-600">
                  {doc.isEditing ? (
                    <input
                      value={doc.description}
                      onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    doc.description
                  )}
                </TableCell>
                <TableCell className="py-2 px-4 flex items-center justify-center">
                  {doc.isEditing ? (
                    <SaveIcon
                      size={20}
                      className="text-green-500 cursor-pointer"
                      onClick={() => saveDocument(index)}
                    />
                  ) : (
                    <EditIcon
                      size={20}
                      className="text-blue-500 cursor-pointer"
                      onClick={() => toggleEdit(index)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DocumentChecklist;
