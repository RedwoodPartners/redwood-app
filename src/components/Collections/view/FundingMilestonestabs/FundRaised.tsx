"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { InfoIcon, PlusCircle, Trash2, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Storage, ID } from "appwrite";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { databases, client } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaEye } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ButtonWithIcon from "@/lib/addButton";

const FUND_RAISED_ID = "6731e2fb000d9580025f";
const FUND_DOCUMENTS_ID = "6768e93900004c965d26";

interface FundRaisedSoFarProps {
  startupId: string;
}

interface Investment {
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storage = useMemo(() => new Storage(client), []);

  const fetchInvestments = useCallback(async () => {
    try {
      const response = await databases.listDocuments(STAGING_DATABASE_ID, FUND_RAISED_ID, [
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
  }, [startupId, toast]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleAddOrUpdateInvestment = async () => {
    if (!selectedInvestment) return;

    if (isSubmitting) return; // Prevent duplicate submission
    setIsSubmitting(true);

    try {
      const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...cleanInvestment } = selectedInvestment;
      
      if (isEditMode && $id) {
        await databases.updateDocument(
          STAGING_DATABASE_ID,
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
          STAGING_DATABASE_ID,
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
    } finally {
      setIsSubmitting(false); // Ensure this runs after saving or if an error occurs
    }
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment || !selectedInvestment.$id) return;

    try {
      await databases.deleteDocument(STAGING_DATABASE_ID, FUND_RAISED_ID, selectedInvestment.$id);
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
      await databases.updateDocument(STAGING_DATABASE_ID, FUND_RAISED_ID, documentId, {
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
  
  const handleDeleteFile = async (documentId: string, fileId: string) => {
    try {
      await storage.deleteFile(FUND_DOCUMENTS_ID, fileId);
      await databases.updateDocument(STAGING_DATABASE_ID, FUND_RAISED_ID, documentId, {
        fileId: null,
        fileName: null,
      });
      fetchInvestments();
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
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB").format(date);
  };
  const handleUploadFileForDialog = async (file: File) => {
    if (!selectedInvestment || !file) return;
  
    try {
      const uploadResponse = await storage.createFile(FUND_DOCUMENTS_ID, ID.unique(), file);
  
      setSelectedInvestment({
        ...selectedInvestment,
        fileId: uploadResponse.$id,
        fileName: file.name,
      });
  
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully!",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "File Size should not Exceed 5Mb",
        description: "Failed to upload the document. Please try again.",
        variant: "destructive",
      });
    } 
  };

  return (
    <div>
      <div className="flex">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Fund Raised So Far</h3>
        <div className="justify-end" onClick={() => openDialog()}>
          <ButtonWithIcon label="Add" />
        </div>
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of recent investments.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Mode of Investment</TableHead>
              <TableHead>Investment Date</TableHead>
              <TableHead>Investment Amount (INR)</TableHead>
              <TableHead className="w-96">Description</TableHead>
              <TableHead className="w-40">Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment, index) => (
              <TableRow key={investment.$id} onDoubleClick={() => openDialog(investment, true)}>
                <TableCell>{investment.mode}</TableCell>
                <TableCell>{formatDate(investment.date)}</TableCell>
                <TableCell>{investment.amount}</TableCell>
                <TableCell>{investment.description}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {investment.fileId ? (
                      <>
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
                      <span className="text-xs text-gray-500">{investment.fileName}</span>
                      <Popover>
                        <PopoverTrigger>
                          <InfoIcon size={16} className="text-gray-500 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(investment.$id!, investment.fileId!)}
                          className="flex items-center"
                        >
                        <Trash2 size={16} className="mr-2" />
                         Delete File
                        </Button>
                        </PopoverContent>
                      </Popover>
                      </>
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
              <TableCell colSpan={2}>Total Investment Amount</TableCell>
              <TableCell>
                {calculateTotalInvestment(investments).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </TableCell>
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
              <Label className="">Mode of Investment</Label>
              <Select
                value={selectedInvestment?.mode || ""}
                onValueChange={(value) => setSelectedInvestment({ ...selectedInvestment, mode: value } as Investment)}
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="CCPS">CCPS</SelectItem>
                  <SelectItem value="CCD">CCD</SelectItem>
                  <SelectItem value="OCD">OCD</SelectItem>
                  <SelectItem value="SAFE Notes">SAFE Notes</SelectItem>
                  <SelectItem value="Grant">Grant</SelectItem>
                  </SelectContent>
              </Select>
              </div>
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
                  required
                  placeholder="Enter the amount"
                  value={selectedInvestment?.amount || ""}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    const formattedValue = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(Number(rawValue) || 0);
                  setSelectedInvestment({ ...selectedInvestment, amount: formattedValue } as Investment);
                  }}
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
              {/* File Upload */}
              <div className="mt-4">
                <Label>Upload Document</Label>
                <div className="flex items-center space-x-2">
                  {selectedInvestment?.fileId ? (
                  <>
                  {/* View & Download Link */}
                  <a
                    href={`${API_ENDPOINT}/storage/buckets/${FUND_DOCUMENTS_ID}/files/${selectedInvestment.fileId}/view?project=${PROJECT_ID}`}
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
                   {/* File Name */}
                  <span className="text-xs text-gray-500">{selectedInvestment.fileName}</span>
                  </>
                  ) : (
                      // Upload New File Input
                      <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFileForDialog(e.target.files[0]);
                        }
                        }}
                      />
                      <UploadCloud size={20} className="cursor-pointer" />
                      </label>
                      )}
                    </div>
                  </div>
            </div>
          </div>
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleDeleteInvestment} className="bg-white text-black border border-black hover:bg-neutral-200">
                Delete
              </Button>
            )}
            <Button onClick={handleAddOrUpdateInvestment} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FundRaisedSoFar;
