"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Client, Databases, Storage, ID } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaEye } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const FUND_RAISED_ID = "6731e2fb000d9580025f";
const FUND_DOCUMENTS_ID = "6768e93900004c965d26";

interface FundRaisedSoFarProps {
  startupId: string;
}

interface Investment {
  stage: string;
  round: string;
  mode: string;
  date: string;
  amount: string;
  description: string;
  startupId?: string;
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $databaseId?: string;
  $collectionId?: string;
  fileId?: string;
  fileName?: string;
}

const FundRaisedSoFar: React.FC<FundRaisedSoFarProps> = ({ startupId }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  
  const client = useMemo(() => new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID), []);
  const databases = useMemo(() => new Databases(client), [client]);
  const storage = useMemo(() => new Storage(client), [client]);
  const { toast } = useToast();

  const fetchInvestments = useCallback(async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, FUND_RAISED_ID, [
        Query.equal("startupId", startupId),
      ]);
      setInvestments(response.documents as Investment[]);
    } catch (error) {
      console.error("Error fetching investments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch investments. Please try again.",
        variant: "destructive",
      });
    }
  }, [databases, startupId, toast]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleAddOrUpdateInvestment = async () => {
    if (!selectedInvestment) return;

    try {
      const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...cleanInvestment } = selectedInvestment;
      
      if (isEditMode && $id) {
        await databases.updateDocument(
          DATABASE_ID,
          FUND_RAISED_ID,
          $id,
          cleanInvestment
        );
        toast({
          title: "Investment updated",
          description: "The investment has been successfully updated.",
        });
      } else {
        await databases.createDocument(
          DATABASE_ID,
          FUND_RAISED_ID,
          ID.unique(),
          { ...cleanInvestment, startupId }
        );
        toast({
          title: "Investment added",
          description: "A new investment has been successfully added.",
        });
      }
      setIsDialogOpen(false);
      fetchInvestments();
    } catch (error) {
      console.error("Error adding/updating investment:", error);
      toast({
        title: "Error",
        description: "Failed to add/update the investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment || !selectedInvestment.$id) return;

    try {
      await databases.deleteDocument(DATABASE_ID, FUND_RAISED_ID, selectedInvestment.$id);
      toast({
        title: "Investment deleted",
        description: "The investment has been successfully deleted.",
      });
      setIsDialogOpen(false);
      fetchInvestments();
    } catch (error) {
      console.error("Error deleting investment:", error);
      toast({
        title: "Error",
        description: "Failed to delete the investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async (index: number, file: File) => {
    const documentId = investments[index].$id;
    if (!documentId) return;

    try {
      const uploadResponse = await storage.createFile(FUND_DOCUMENTS_ID, ID.unique(), file);
      await databases.updateDocument(DATABASE_ID, FUND_RAISED_ID, documentId, {
        fileId: uploadResponse.$id,
        fileName: file.name,
      });
      fetchInvestments();
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

  const openDialog = (investment: Investment | null = null, edit: boolean = false) => {
    setSelectedInvestment(investment || {
      stage: "",
      round: "",
      mode: "",
      date: "",
      amount: "",
      description: "",
    });
    setIsEditMode(edit);
    setIsDialogOpen(true);
  };

  const calculateTotalInvestment = (investments: Investment[]): number => {
    return investments.reduce((total, investment) => {
      const amount = parseFloat(investment.amount.replace(/[^0-9.-]+/g, ""));
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  return (
    <div>
      <div className="flex">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Fund Raised So Far</h3>
        <div className="justify-end mb-2">
          <PlusCircle size={20} className="mr-3 cursor-pointer" onClick={() => openDialog()} />
        </div>
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of recent investments.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Investment Stage</TableHead>
              <TableHead>Round</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Investment Date</TableHead>
              <TableHead>Investment Amount (INR)</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment, index) => (
              <TableRow key={investment.$id} onDoubleClick={() => openDialog(investment, true)}>
                <TableCell>{investment.stage}</TableCell>
                <TableCell>{investment.round}</TableCell>
                <TableCell>{investment.mode}</TableCell>
                <TableCell>{investment.date}</TableCell>
                <TableCell>{investment.amount}</TableCell>
                <TableCell>{investment.description}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
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
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files && handleUploadFile(index, e.target.files[0])}
                        />
                        <UploadCloud size={20} className="cursor-pointer" />
                      </label>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell colSpan={4}>Total Investment Amount</TableCell>
              <TableCell>
                {calculateTotalInvestment(investments).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Investment" : "Add New Investment"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Edit the details of the investment." : "Fill out the details for the new investment."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">Stage</Label>
                <Input
                  type="text"
                  placeholder="Enter the investment stage"
                  value={selectedInvestment?.stage || ""}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, stage: e.target.value } as Investment)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Round</Label>
                <Input
                  type="text"
                  placeholder="Enter the round name"
                  value={selectedInvestment?.round || ""}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, round: e.target.value } as Investment)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Mode of Investment</Label>
                <select
                  value={selectedInvestment?.mode || ""}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, mode: e.target.value } as Investment)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Mode</option>
                  <option value="Equity">Equity</option>
                  <option value="CCPS">CCPS</option>
                  <option value="CCD">CCD</option>
                  <option value="OCD">OCD</option>
                  <option value="SAFE Notes">SAFE Notes</option>
                  <option value="Grant">Grant</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">Investment Date</Label>
                <Input
                  type="date"
                  value={selectedInvestment?.date || ""}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, date: e.target.value } as Investment)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Investment Amount (INR)</Label>
                <Input
                  type="text"
                  placeholder="Enter the amount"
                  value={selectedInvestment?.amount || ""}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, amount: e.target.value } as Investment)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  placeholder="Enter a description for the investment"
                  value={selectedInvestment?.description || ""}
                  onChange={(e) => setSelectedInvestment({ ...selectedInvestment, description: e.target.value } as Investment)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleDeleteInvestment} variant="destructive">
                Delete
              </Button>
            )}
            <Button onClick={handleAddOrUpdateInvestment}>
              {isEditMode ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FundRaisedSoFar;
