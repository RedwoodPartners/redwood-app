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
import { PlusCircle, SaveIcon, UploadCloud } from "lucide-react";
import { Query, ID, Client, Databases, Storage } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { useToast } from "@/hooks/use-toast";
import { FaEye } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";

const DOC_CHECKLIST_ID = "673c200b000a415bbbad";
const BUCKET_ID = "66eb0cfc000e821db4d9";

interface DocChecklistProps {
  startupId: string;
}

const DocumentChecklist: React.FC<DocChecklistProps> = ({ startupId }) => {
  const [docData, setDocData] = useState<any[]>([]);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [newDoc, setNewDoc] = useState({
    docName: "",
    docType: "",
    status: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);
  const storage = new Storage(client);
  const { toast } = useToast();

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const storage = new Storage(client);
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
      const updatedChangedRows = new Set(changedRows);
      updatedChangedRows.delete(index);
      setChangedRows(updatedChangedRows);
      toast({
        title: "Document saved",
        description: "The document has been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving document data:", error);
      toast({
        title: "Error",
        description: "Failed to save the document.",
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async (index: number, file: File) => {
    const documentId = docData[index].$id;
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      try {
        const uploadResponse = await storage.createFile(BUCKET_ID, ID.unique(), file);
        await databases.updateDocument(DATABASE_ID, DOC_CHECKLIST_ID, documentId, {
          fileId: uploadResponse.$id,
          fileName: file.name,
        });
        const updatedData = [...docData];
        updatedData[index] = {
          ...updatedData[index],
          fileId: uploadResponse.$id,
          fileName: file.name,
        };
        setDocData(updatedData);
        toast({
          title: "Document upload successful",
          description: "Your document has been uploaded successfully!",
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Error",
          description: "Failed to upload the document. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a file with an allowed extension.",
        variant: "destructive",
      });
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
      toast({
        title: "Document added",
        description: "A new document has been added to the checklist.",
      });
    } catch (error) {
      console.error("Error adding document data:", error);
      toast({
        title: "Error",
        description: "Failed to add the new document.",
        variant: "destructive",
      });
    }
  };

  const handleDoubleClick = (index: number) => {
    setRowToDelete(index);
  };

  const handleDeleteRow = async (index: number) => {
    try {
      await databases.deleteDocument(DATABASE_ID, DOC_CHECKLIST_ID, docData[index].$id);
      const updatedData = docData.filter((_, i) => i !== index);
      setDocData(updatedData);
      setRowToDelete(null);
      toast({
        title: "Row deleted",
        description: "The document row has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete the document row.",
        variant: "destructive",
      });
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
            <TableRow key={row.$id} onDoubleClick={() => handleDoubleClick(index)}>
              <TableCell>
                <input
                  type="text"
                  value={row.docName}
                  onChange={(e) => handleEditChange(index, "docName", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <select
                  value={row.docType}
                  onChange={(e) => handleEditChange(index, "docType", e.target.value)}
                  className="h-6 border-none rounded focus:outline-none"
                >
                  <option value="" disabled>Select Type</option>
                  <option value="Regulatory and Registration">Regulatory and Registration</option>
                  <option value="Legal">Legal</option>
                  <option value="Financial">Financial</option>
                  <option value="Technical">Technical</option>
                  <option value="Compliance Forms">Compliance Forms</option>
                  <option value="Director and Promotor Documents">Director and Promotor Documents</option>
                  <option value="Portal Credentials">Portal Credentials</option>
                  <option value="RP Workings">RP Workings</option>
                  <option value="Received Document">Received Document</option>
                </select>
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
                <Textarea
                  id="message-2"
                  value={row.description}
                  onChange={(e) => handleEditChange(index, "description", e.target.value)}
                  className="w-full h-20 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-start space-x-2">
                  {row.fileId ? (
                    <a
                      href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${row.fileId}/view?project=${PROJECT_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      <div className="relative group">
                        <FaEye size={20} className="inline" />
                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                          View & Download
                        </span>
                      </div>
                    </a>
                  ) : null}
                  {changedRows.has(index) ? (
                    <button onClick={() => handleSaveDocument(index)} className="text-black rounded-full transition ml-2">
                      <div className="relative group ml-3">
                        <SaveIcon size={20} className="cursor-pointer text-green-500" />
                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                          Save
                        </span>
                      </div>
                    </button>
                  ) : null}
                  <label className="ml-2">
                    <input
                      type="file"
                      className="hidden"
                      accept=".doc,.docx,.xls,.xlsx,.zip,.pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(index, file);
                      }}
                    />
                    <div className="relative group">
                      <UploadCloud size={20} className="cursor-pointer" />
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Upload
                      </span>
                    </div>
                  </label>
                  <p className="text-xs">{row.fileName}</p>
                </div>
              </TableCell>
              {rowToDelete === index && (
                <TableCell colSpan={5}>
                  <div className="flex justify-center items-center space-x-4">
                    <p>Delete this row?</p>
                    <button
                      onClick={() => handleDeleteRow(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setRowToDelete(null)}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      No
                    </button>
                  </div>
                </TableCell>
              )}
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
              <select
                value={newDoc.docType}
                onChange={(e) => setNewDoc({ ...newDoc, docType: e.target.value })}
                className="h-6 border-none rounded focus:outline-none"
              >
                <option value="" disabled>Select Type</option>
                <option value="Regulatory and Registration">Regulatory and Registration</option>
                <option value="Legal">Legal</option>
                <option value="Financial">Financial</option>
                <option value="Technical">Technical</option>
                <option value="Compliance Forms">Compliance Forms</option>
                <option value="Director and Promotor Documents">Director and Promotor Documents</option>
                <option value="Portal Credentials">Portal Credentials</option>
                <option value="RP Workings">RP Workings</option>
                <option value="Received Document">Received Document</option>
              </select>
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
                <div className="relative group">
                  <PlusCircle size={20} />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                    Add Row
                  </span>
                </div>
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentChecklist;
