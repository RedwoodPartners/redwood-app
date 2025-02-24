"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, Trash2, UploadCloud, CheckCircle, Circle, MessageCircle } from "lucide-react";
import { Query, ID, Storage } from "appwrite";
import { STAGING_DATABASE_ID, PROJECT_ID, API_ENDPOINT, STARTUP_ID } from "@/appwrite/config";
import { databases, client } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FaEye } from 'react-icons/fa';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DOC_CHECKLIST_ID = "673c200b000a415bbbad";
const BUCKET_ID = "66eb0cfc000e821db4d9";
const DOCUMENT_OPTIONS_COLLECTION_ID = "67b4b97900371c532d9a";

interface DocChecklistProps {
  startupId: string;
}
interface Document {
  [key: string]: any; 
}


const DocumentChecklist: React.FC<DocChecklistProps> = ({ startupId }) => {
  const [docData, setDocData] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDoc, setNewDoc] = useState({
    docName: "",
    docType: "",
    status: "",
    description: "",
    financialYear: "",
  });

  const [natureOfCompany, setNatureOfCompany] = useState<string>("LLP");
  const [fetchedDocumentOptions, setFetchedDocumentOptions] = useState<any[]>([]);

  const storage = useMemo(() => new Storage(client), []);
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [newDocFile, setNewDocFile] = useState<File | null>(null); 
  const [editingDocFile, setEditingDocFile] = useState<File | null>(null);


  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, [
          Query.equal("startupId", startupId),
        ]);
        setDocData(response.documents);

        //Fetch natureOfCompany from Startups
        const startupResponse = await databases.getDocument(
          STAGING_DATABASE_ID,
          STARTUP_ID,
          startupId
        )
        setNatureOfCompany(startupResponse.natureOfCompany);
      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };
    //fetch Document checklist options
    const fetchDocumentOptions = async () => {
      try {
        let allDocuments: Document[] = [];
        let hasMoreDocuments = true;
        let offset = 0;
        const limit = 100;
    
        while (hasMoreDocuments) {
          const response = await databases.listDocuments(
            STAGING_DATABASE_ID,
            DOCUMENT_OPTIONS_COLLECTION_ID,
            [
              Query.limit(limit), 
              Query.offset(offset),
            ]
          );
          // Add the fetched documents to the array
          allDocuments = [...allDocuments, ...response.documents];
    
          // Check if there are more documents to fetch
          if (response.documents.length < limit) {
            hasMoreDocuments = false; 
          } else {
            offset += limit; // Move to the next batch
          }
        }
    
        // Store all fetched documents in state
        setFetchedDocumentOptions(allDocuments);
      } catch (error) {
        console.error("Error fetching document options:", error);
      }
    };
    fetchDocumentOptions();
    
    fetchDocuments();
  }, [startupId]);

  const handleSaveDocument = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
    try {
      let fileId = null;
      let fileName = null;

      // Upload file if provided
      if (newDocFile) {
        const uploadResponse = await storage.createFile(BUCKET_ID, ID.unique(), newDocFile);
        fileId = uploadResponse.$id;
        fileName = newDocFile.name;
      }
      const response = await databases.createDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, ID.unique(), {
        ...newDoc,
        startupId,
        fileId,
        fileName,
      });
      setDocData([...docData, response]);
      setNewDoc({ docName: "", docType: "", status: "", description: "", financialYear: "" });
      setIsAddDialogOpen(false);
      setNewDocFile(null);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDocument = async () => {
    try {
      let updatedFields = { ...editingDoc };

      // Upload new file if provided
      if (editingDocFile) {
        const uploadResponse = await storage.createFile(BUCKET_ID, ID.unique(), editingDocFile);
        updatedFields.fileId = uploadResponse.$id;
        updatedFields.fileName = editingDocFile.name;
      }
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...validFields } = editingDoc;
      await databases.updateDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, $id, validFields);
      const updatedData = docData.map(doc => doc.$id === editingDoc.$id ? { ...doc, ...validFields } : doc);
      setDocData(updatedData);
      setEditingDoc(null);
      setEditingDocFile(null);
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
      await databases.deleteDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, editingDoc.$id);
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
          await databases.updateDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, documentId, updatedDoc);
          
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
      await databases.updateDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, documentId, {
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

  // Function to toggle verification status
  const handleToggleVerify = async (documentId: string, isVerified: boolean) => {
    try {
      // Update the document in the database
      await databases.updateDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, documentId, {
        verified: !isVerified,
      });

      // Update local state
      const updatedDocData = docData.map((doc) =>
        doc.$id === documentId ? { ...doc, verified: !isVerified } : doc
      );
      setDocData(updatedDocData);

      toast({
        title: "Verification Updated",
        description: `Document has been ${!isVerified ? "verified" : "unverified"}.`,
      });
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  // Function to handle adding a comment
  const handleAddComment = async () => {
    if (!selectedDoc || !newComment.trim()) return;

    try {
      // Update comments in the database
      const updatedComments = [...(selectedDoc.comments || []), newComment];
      await databases.updateDocument(STAGING_DATABASE_ID, DOC_CHECKLIST_ID, selectedDoc.$id, {
        comments: updatedComments,
      });

      // Update local state
      const updatedDocData = docData.map((doc) =>
        doc.$id === selectedDoc.$id ? { ...doc, comments: updatedComments } : doc
      );
      setDocData(updatedDocData);

      // Reset state
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
 
  const getDocumentType = (docName: string): string => {
    const document = fetchedDocumentOptions.find((doc: any) => doc.docName === docName);
    return document?.docType || "";
  };

  // Render options dynamically based on natureOfCompany
  const renderOptions = (natureOfCompany: string) => {
    return fetchedDocumentOptions
      .filter((doc: any) => doc.natureOfCompany.includes(natureOfCompany)) // Filter by natureOfCompany
      .map((doc: any) => (
        <SelectItem key={doc.docName} value={doc.docName}>
          {doc.docName}
        </SelectItem>
      ));
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
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Label>Document Name</Label>
                <Select
                  value={newDoc.docName}
                  onValueChange={(value) => {
                  setNewDoc({
                    ...newDoc,
                    docName: value,
                    docType: getDocumentType(value), // Automatically set docType based on selection
                  });
                  }}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Select Document Name" />
                </SelectTrigger>
                <SelectContent className="absolute z-50 w-96 h-72">
                  {renderOptions(natureOfCompany)}
                <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
                </Select>

              </div>
              <div>
                <Label>Document Type</Label>
                <Input
                  placeholder="Document Type"
                  value={newDoc.docType}
                  readOnly
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={newDoc.status}
                  onValueChange={(value) => setNewDoc({ ...newDoc, status: value })}
                >
                  <SelectTrigger className="w-full p-2 text-sm border rounded">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Description"
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Financial Year</Label>
                <Select
                  value={newDoc.financialYear}
                  onValueChange={(value) => setNewDoc({ ...newDoc, financialYear: value })}
                >
                <SelectTrigger className="w-full p-2 text-sm border rounded">
                  <SelectValue placeholder="Select Financial Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2020-21">2020-21</SelectItem>
                  <SelectItem value="2021-22">2021-22</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2023-24">2024-25</SelectItem>
                  <SelectItem value="2023-24">2025-26</SelectItem>
                </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Upload File</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                      setNewDocFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveDocument} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
                </Button>
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
              <TableHead className="w-auto">Description</TableHead>
              <TableHead>Financial Year</TableHead>
              <TableHead className="w-44">Documents</TableHead>
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
                <TableCell>{row.financialYear}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-start space-x-4">
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
                   {/* Comment Icon */}
                  <div className="flex items-center space-x-2">
                    <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
                      <DialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger>
                          <MessageCircle
                          size={20}
                          className="text-gray-500 cursor-pointer"
                          onClick={() => {
                            setSelectedDoc(row);
                            setIsCommentDialogOpen(true);
                          }} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Comments</p>
                          </TooltipContent> 
                        </Tooltip>
                      </DialogTrigger>
                      <DialogContent className="w-full max-w-lg p-6">
                        <DialogHeader>
                          <DialogTitle>Comments for {selectedDoc?.docName}</DialogTitle>
                          <DialogDescription aria-describedby={undefined}>
                          </DialogDescription>
                        </DialogHeader>

                        {/* Display Existing Comments */}
                        <div className="space-y-4 mb-4">
                          {selectedDoc?.comments?.length ? (
                            selectedDoc.comments.map((comment: string, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-100 p-2 rounded-md text-sm text-black"
                              >
                                {comment}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No comments yet.</p>
                          )}
                        </div>

                        {/* Add New Comment */}
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-4"
                        />
                        <Button onClick={handleAddComment}>Add Comment</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                   {/* Verify Icon */}
                  <div
                    className="cursor-pointer"
                    onClick={() => handleToggleVerify(row.$id, row.verified)}
                  >
                    <div className="mt-1">
                    {row.verified ? (
                      <Tooltip>
                        <TooltipTrigger>
                        <CheckCircle size={20} className="text-green-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger>
                        <Circle size={20} className="text-gray-500 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unverified</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    </div>
                  </div>
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
          <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <Label>Document Name</Label>
            <Select
              value={editingDoc?.docName || ""}
              onValueChange={(value) => {
              setEditingDoc({
                ...editingDoc,
                docName: value,
                docType: getDocumentType(value), // Automatically update docType
                });
              }}
            >
            <SelectTrigger>
              <SelectValue placeholder="Select Document Name" />
            </SelectTrigger>
            <SelectContent className="absolute z-50 w-96 h-72">
               {/* Dynamically render document options based on natureOfCompany */}
                {fetchedDocumentOptions
                  .filter((option: any) => option.natureOfCompany.includes(natureOfCompany)) // Filter by natureOfCompany
                  .map((option: any) => (
                <SelectItem key={option.docName} value={option.docName}>
                  {option.docName}
                </SelectItem>
                ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Document Type</Label>
            <Input
              placeholder="Document Type"
              value={editingDoc?.docType || ""}
              readOnly 
              />
          </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editingDoc?.status || ""}
                onValueChange={(value) => setEditingDoc({ ...editingDoc, status: value })}
              >
                <SelectTrigger className="w-full p-2 text-sm border rounded">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Description"
                value={editingDoc?.description}
                onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Financial Year</Label>
              <Select
                value={editingDoc?.financialYear}
                onValueChange={(value) => setEditingDoc({ ...editingDoc, financialYear: value })}
              >
                <SelectTrigger className="w-full p-2 text-sm border rounded">
                  <SelectValue placeholder="Select Financial Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2020-21">2020-21</SelectItem>
                  <SelectItem value="2021-22">2021-22</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2023-24">2024-25</SelectItem>
                  <SelectItem value="2023-24">2025-26</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Upload File</Label>
              <Input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditingDocFile(e.target.files[0]);
                  }
                }}
              />
              <div>
                {editingDoc?.fileId && (
                <a
                  href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${editingDoc.fileId}/view?project=${PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                ({editingDoc.fileName})
                </a>
                )}
              </div>
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
