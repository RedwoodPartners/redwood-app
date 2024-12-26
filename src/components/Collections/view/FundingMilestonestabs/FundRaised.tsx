"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, SaveIcon, UploadCloud, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Client, Databases, Storage, ID } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { FaEye } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export const FUND_RAISED_ID = "6731e2fb000d9580025f";
const FUND_DOCUMENTS_ID = "6768e93900004c965d26";

interface FundRaisedSoFarProps {
  startupId: string;
}

const FundRaisedSoFar: React.FC<FundRaisedSoFarProps> = ({ startupId }) => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [changedRows, setChangedRows] = useState(new Set<number>());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ index: number; fileId: string } | null>(null);
  const [newInvestment, setNewInvestment] = useState({
    stage: "",
    round: "",
    mode: "",
    date: "",
    amount: "",
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
    const fetchInvestments = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, FUND_RAISED_ID, [
          Query.equal("startupId", startupId),
        ]);
        setInvestments(response.documents);
      } catch (error) {
        console.error("Error fetching investments:", error);
      }
    };
    fetchInvestments();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedInvestments = [...investments];
    updatedInvestments[index][field] = value;
    setInvestments(updatedInvestments);
    setEditingIndex(index);
    setChangedRows(prevRows => new Set(prevRows).add(index));
  };
  
  

  const handleSaveInvestment = async (index: number) => {
    const investment = investments[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = investment;
    try {
      await databases.updateDocument(DATABASE_ID, FUND_RAISED_ID, $id, dataToUpdate);
      setEditingIndex(null);
      setChangedRows(prevRows => {
        const newSet = new Set(prevRows);
        newSet.delete(index);
        return newSet;
      });
      toast({
        title: "Investment saved",
        description: "The investment has been successfully saved.",
      });
    } catch (error) {
      console.error("Error saving investment:", error);
      toast({
        title: "Error",
        description: "Failed to save the investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddInvestment = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        FUND_RAISED_ID,
        ID.unique(),
        { ...newInvestment, startupId }
      );
      setInvestments([...investments, response]);
      setNewInvestment({
        stage: "",
        round: "",
        mode: "",
        date: "",
        amount: "",
        description: "",
      });
      toast({
        title: "Investment added",
        description: "A new investment has been successfully added.",
      });
    } catch (error) {
      console.error("Error adding investment:", error);
      toast({
        title: "Error",
        description: "Failed to add the investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async (index: number, file: File) => {
    const documentId = investments[index].$id;
    try {
      const uploadResponse = await storage.createFile(FUND_DOCUMENTS_ID, ID.unique(), file);
      await databases.updateDocument(DATABASE_ID, FUND_RAISED_ID, documentId, {
        fileId: uploadResponse.$id,
        fileName: file.name,
      });
      const updatedData = [...investments];
      updatedData[index] = {
        ...updatedData[index],
        fileId: uploadResponse.$id,
        fileName: file.name,
      };
      setInvestments(updatedData);
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
  };

  const handleRowDoubleTap = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const handleDeleteInvestment = async (index: number) => {
    try {
      await databases.deleteDocument(DATABASE_ID, FUND_RAISED_ID, investments[index].$id);
      const updatedInvestments = investments.filter((_, i) => i !== index);
      setInvestments(updatedInvestments);
      setDeleteConfirmIndex(null);
      toast({
        title: "Investment deleted",
        description: "The investment has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting investment:", error);
      toast({
        title: "Error",
        description: "Failed to delete the investment. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteFile = async (index: number, fileId: string) => {
    setFileToDelete({ index, fileId });
    setShowDeleteFileDialog(true);
  };
  const confirmDeleteFile = async () => {
    if (fileToDelete) {
      try {
        await storage.deleteFile(FUND_DOCUMENTS_ID, fileToDelete.fileId);
        await databases.updateDocument(DATABASE_ID, FUND_RAISED_ID, investments[fileToDelete.index].$id, {
          fileId: null,
          fileName: null,
        });

        const updatedInvestments = [...investments];
        updatedInvestments[fileToDelete.index] = {
          ...updatedInvestments[fileToDelete.index],
          fileId: null,
          fileName: null,
        };
        setInvestments(updatedInvestments);

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
    }
    setShowDeleteFileDialog(false);
    setFileToDelete(null);
  };


  const totalAmount = investments.reduce((sum, investment) => {
    const amount = parseFloat(investment.amount.replace(/₹|,/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Fund Raised So Far</h3>
      <Table className="border border-gray-300 shadow-lg bg-white">
        <TableCaption>A list of recent investments.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Investment Stage</TableHead>
            <TableHead>Round Name</TableHead>
            <TableHead>Mode of Investment</TableHead>
            <TableHead>Investment Date</TableHead>
            <TableHead>Investment Amount (INR)</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment, index) => (
            <TableRow 
              key={investment.$id}
              onDoubleClick={() => handleRowDoubleTap(index)}
            >
              <TableCell>
                <input
                  type="text"
                  value={investment.stage}
                  onChange={(e) => handleEditChange(index, "stage", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={investment.round}
                  onChange={(e) => handleEditChange(index, "round", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <select
                  value={investment.mode}
                  onChange={(e) => handleEditChange(index, "mode", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Equity">Equity</option>
                  <option value="CCPS">CCPS</option>
                  <option value="CCD">CCD</option>
                  <option value="OCD">OCD</option>
                  <option value="SAFE Notes">SAFE Notes</option>
                  <option value="Grant">Grant</option>
                </select>
              </TableCell>
              <TableCell>
                <input
                  type="date"
                  value={investment.date}
                  onChange={(e) => handleEditChange(index, "date", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={investment.amount}
                  onChange={(e) => handleEditChange(index, "amount", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={investment.description}
                  onChange={(e) => handleEditChange(index, "description", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {deleteConfirmIndex === index ? (
                  <div className="flex space-x-2">
                    <span>Delete row?</span>
                    <button
                      onClick={() => handleDeleteInvestment(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirmIndex(null)}
                      className="bg-gray-300 text-black px-2 py-1 rounded"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-start space-x-2">
                    {investment.fileId ? (
                      <a
                        href={`${API_ENDPOINT}/storage/buckets/${FUND_DOCUMENTS_ID}/files/${investment.fileId}/view?project=${PROJECT_ID}`}
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
                    {changedRows.has(index) && (
                      <button onClick={() => handleSaveInvestment(index)} className="text-black rounded-full transition ml-2">
                        <div className="relative group">
                          <SaveIcon size={20} className="cursor-pointer text-green-500" />
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                            Save
                          </span>
                        </div>
                      </button>
                    )}
                    <label className="ml-2">
                      <input
                        type="file"
                        className="hidden"
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

                    {/*Delete file*/ }
                    <button onClick={() => handleDeleteFile(index, investment.fileId)} className="text-red-500">
                      <p className="text-xs text-gray-800 underline">{investment.fileName}</p>
                    </button>
                    
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <input
                type="text"
                disabled
                value={newInvestment.stage}
                onChange={(e) => setNewInvestment({ ...newInvestment, stage: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Stage"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newInvestment.round}
                onChange={(e) => setNewInvestment({ ...newInvestment, round: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Round"
              />
            </TableCell>
            <TableCell>
              <select
                disabled
                value={newInvestment.mode}
                onChange={(e) => setNewInvestment({ ...newInvestment, mode: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
              >
                <option value="">Select</option>
                <option value="Equity">Equity</option>
                <option value="CCPS">CCPS</option>
                <option value="CCD">CCD</option>
                <option value="OCD">OCD</option>
                <option value="SAFE Notes">SAFE Notes</option>
                <option value="Grant">Grant</option>
              </select>
            </TableCell>
            <TableCell>
              <input
                type="date"
                disabled
                value={newInvestment.date}
                onChange={(e) => setNewInvestment({ ...newInvestment, date: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newInvestment.amount}
                onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Amount"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newInvestment.description}
                onChange={(e) => setNewInvestment({ ...newInvestment, description: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Description"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddInvestment} className="text-black rounded-full transition">
                <div className="relative group">
                  <PlusCircle size={20} />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Add Row
                    </span>
                </div>
              </button>
            </TableCell>
          </TableRow>
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={4} className="text-right">Total:</TableCell>
            <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
      <Dialog open={showDeleteFileDialog} onOpenChange={setShowDeleteFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteFileDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFile}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FundRaisedSoFar;
