"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Info, InfoIcon, PlusCircle, SaveIcon, Trash, Trash2, TrashIcon, UploadCloud } from "lucide-react";
import { Query, ID, Client, Databases, Storage } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { useToast } from "@/hooks/use-toast";
import { FaEye } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DOC_CHECKLIST_ID = "673c200b000a415bbbad";
const BUCKET_ID = "66eb0cfc000e821db4d9";

interface DocChecklistProps {
  startupId: string;
}

const DocumentChecklist: React.FC<DocChecklistProps> = ({ startupId }) => {
  const [docData, setDocData] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [newDoc, setNewDoc] = useState({
    docName: "",
    docType: "",
    status: "",
    description: "",
  });

  const client = useMemo(() => new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID), []);
  const databases = useMemo(() => new Databases(client), [client]);
  const storage = useMemo(() => new Storage(client), [client]);
  const { toast } = useToast();
  const [activeInfoIcon, setActiveInfoIcon] = useState<string | null>(null);


  useEffect(() => {
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
  }, [startupId, databases]);

  const handleSaveDocument = async () => {
    try {
      const response = await databases.createDocument(DATABASE_ID, DOC_CHECKLIST_ID, ID.unique(), {
        ...newDoc,
        startupId,
      });
      setDocData([...docData, response]);
      setNewDoc({ docName: "", docType: "", status: "", description: "" });
      setIsAddDialogOpen(false);
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

  const handleEditDocument = async () => {
    try {
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...validFields } = editingDoc;
      await databases.updateDocument(DATABASE_ID, DOC_CHECKLIST_ID, $id, validFields);
      const updatedData = docData.map(doc => doc.$id === editingDoc.$id ? { ...doc, ...validFields } : doc);
      setDocData(updatedData);
      setIsEditDialogOpen(false);
      toast({
        title: "Document updated",
        description: "The document has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating document data:", error);
      toast({
        title: "Error",
        description: "Failed to update the document.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await databases.deleteDocument(DATABASE_ID, DOC_CHECKLIST_ID, editingDoc.$id);
      const updatedData = docData.filter(doc => doc.$id !== editingDoc.$id);
      setDocData(updatedData);
      setIsEditDialogOpen(false);
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete the document.",
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async (index: number, file: File) => {
    const documentId = docData[index].$id;
    if (!documentId) return;

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'csv'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      try {
        const uploadResponse = await storage.createFile(BUCKET_ID, ID.unique(), file);
        if (uploadResponse && uploadResponse.$id) {
          const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...validFields } = docData[index];
          const updatedDoc = {
            ...validFields,
            fileId: uploadResponse.$id,
            fileName: file.name,
          };
          await databases.updateDocument(DATABASE_ID, DOC_CHECKLIST_ID, documentId, updatedDoc);
          
          // Update the local state
          const updatedDocData = [...docData];
          updatedDocData[index] = { ...updatedDocData[index], ...updatedDoc };
          setDocData(updatedDocData);

          toast({
            title: "Document upload successful",
            description: "Your document has been uploaded successfully!",
          });
        } else {
          throw new Error("Invalid upload response");
        }
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

  const handleDeleteFile = async (documentId: string, fileId: string) => {
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
      await databases.updateDocument(DATABASE_ID, DOC_CHECKLIST_ID, documentId, {
        fileId: null,
        fileName: null
      });
      const updatedDocData = docData.map(doc => 
        doc.$id === documentId ? { ...doc, fileId: null, fileName: null } : doc
      );
      setDocData(updatedDocData);
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Document Checklist</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <PlusCircle size={20} className="mb-2 mr-3 cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
              <DialogDescription>Enter the details for the new document.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <Label>Document Name</Label>
                <Input
                  placeholder="Document Name"
                  value={newDoc.docName}
                  onChange={(e) => setNewDoc({ ...newDoc, docName: e.target.value })}
                />
              </div>
              <div>
                <Label>Document Type</Label>
                <Select
                  value={newDoc.docType}
                  onValueChange={(value) => setNewDoc({ ...newDoc, docType: value })}
                >
                <SelectTrigger className="w-full p-2 text-sm border rounded">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Select">Select</SelectItem>
                  <SelectItem value="Regulatory and Registration">Regulatory and Registration</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Compliance Forms">Compliance Forms</SelectItem>
                  <SelectItem value="Director and Promotor Documents">Director and Promotor Documents</SelectItem>
                  <SelectItem value="Portal Credentials">Portal Credentials</SelectItem>
                  <SelectItem value="RP Workings">RP Workings</SelectItem>
                  <SelectItem value="Received Document">Received Document</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Input
                  placeholder="Status"
                  value={newDoc.status}
                  onChange={(e) => setNewDoc({ ...newDoc, status: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Description"
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveDocument}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of documents for the startup.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[500px]">Description</TableHead>
              <TableHead className="w-36">Documents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docData.map((row, index) => (
              <TableRow
                key={row.$id}
                onDoubleClick={() => {
                  setEditingDoc(row);
                  setIsEditDialogOpen(true);
                }}
              >
                <TableCell>{row.docName}</TableCell>
                <TableCell>{row.docType}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-start space-x-2">
                    {row.fileId ? (
                      <>
                      <a href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${row.fileId}/view?project=${PROJECT_ID}`} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => {
                        if (row.fileName.endsWith('.zip')) {
                          e.preventDefault();
                          window.location.href = `${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${row.fileId}/download?project=${PROJECT_ID}`;
                        }
                       }} 
                        className="text-blue-600 underline">
                        <div className="relative group">
                          <FaEye size={20} className="inline" />
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                          View & Download
                          </span>
                        </div>
                      </a>
                      <span className="text-xs text-gray-500">{row.fileName}</span>
                      <Popover>
                        <PopoverTrigger>
                          <Trash2 size={16} className="text-gray-500 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(row.$id, row.fileId)}
                          className="flex items-center"
                        >
                        <Trash2 size={16} className="mr-2" />
                          Delete File
                        </Button>
                        </PopoverContent>
                      </Popover>
                      </>
                   ) : (
                    <label className="ml-2">
                      <div className="relative group">
                        <UploadCloud size={20} className="cursor-pointer" />
                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                         Upload
                        </span>
                      </div>
                      
                      <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFile(index, e.target.files[0]);
                        }
                      }} />
                    </label>
                   )}
                  </div>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Modify the document details below.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <Label>Document Name</Label>
              <Input
                placeholder="Document Name"
                value={editingDoc?.docName}
                onChange={(e) => setEditingDoc({ ...editingDoc, docName: e.target.value })}
              />
            </div>
            <div>
              <Label>Document Type</Label>
              <Select
                value={editingDoc?.docType || ""}
                onValueChange={(value) => setEditingDoc({ ...editingDoc, docType: value })}
              >
              <SelectTrigger className="w-full p-2 text-sm border rounded">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Select">Select</SelectItem>
                <SelectItem value="Regulatory and Registration">Regulatory and Registration</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Compliance Forms">Compliance Forms</SelectItem>
                <SelectItem value="Director and Promotor Documents">Director and Promotor Documents</SelectItem>
                <SelectItem value="Portal Credentials">Portal Credentials</SelectItem>
                <SelectItem value="RP Workings">RP Workings</SelectItem>
                <SelectItem value="Received Document">Received Document</SelectItem>
              </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Input
                placeholder="Status"
                value={editingDoc?.status}
                onChange={(e) => setEditingDoc({ ...editingDoc, status: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Description"
                value={editingDoc?.description}
                onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDeleteDocument} className="bg-white text-black border border-black hover:bg-neutral-200">Delete</Button>
            <Button onClick={handleEditDocument}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentChecklist;
