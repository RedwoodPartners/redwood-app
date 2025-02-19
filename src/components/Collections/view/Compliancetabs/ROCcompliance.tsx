"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROC_ID = "6739c2c40032254ca4b6";
const FORMS_ID = "67b45189001e40764c83";

interface RocComplianceProps {
  startupId: string;
}

const RocCompliance: React.FC<RocComplianceProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingCompliance, setEditingCompliance] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCompliance, setNewCompliance] = useState({
    query: "",
    yesNo: "",
    date: "",
    description: "",
  });
  const [queryOptions, setQueryOptions] = useState<string[]>([]); // State for dynamic query options
  const [natureOfCompany, setNatureOfCompany] = useState<string>("");

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, ROC_ID, [
          Query.equal("startupId", startupId),
        ]);
        const filteredDocuments = response.documents.map(doc => {
          const { $id, query, yesNo, date, description } = doc;
          return { $id, query, yesNo, date, description };
        });
        setComplianceData(filteredDocuments);
        //Fetch natureOfCompany from Startups
        const startupResponse = await databases.getDocument(
          STAGING_DATABASE_ID,
          STARTUP_ID,
          startupId
          )
        setNatureOfCompany(startupResponse.natureOfCompany);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };
    fetchComplianceData();
  }, [startupId]);
  // Fetch dynamic query options based on natureOfCompany
  useEffect(() => {
    const fetchQueryOptions = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, FORMS_ID, [
          Query.equal("natureOfCompany", natureOfCompany), // Filter by natureOfCompany
        ]);
        const options = response.documents.map((doc) => doc.query);
        setQueryOptions(options);
      } catch (error) {
        console.error("Error fetching query options:", error);
      }
    };    
    fetchQueryOptions();
  }, [natureOfCompany]);
  
  //when editing
  const handleSaveCompliance = async () => {
    if (!editingCompliance) return;
  
    try {
      const { query, yesNo } = editingCompliance;
      // Fetch the document from FORMS_ID based on the selected query
      const response = await databases.listDocuments(STAGING_DATABASE_ID, FORMS_ID, [
        Query.equal("query", query),
      ]);
  
      if (response.documents.length > 0) {
        const formDocument = response.documents[0];
        const yesNoValues = formDocument.yesNo; // Fetch yesNo attribute (array)
        // Update description dynamically based on Yes/No selection
        const description =
          yesNo === "Yes"
            ? yesNoValues[0] 
            : yesNoValues[1]; 
        const updatedData = { ...editingCompliance, description };

        const allowedFields = ["query", "yesNo", "date", "description"];
        const updateData = Object.fromEntries(
          Object.entries(updatedData).filter(([key]) => allowedFields.includes(key))
        );
  
        await databases.updateDocument(STAGING_DATABASE_ID, ROC_ID, editingCompliance.$id, updateData);
  
        // Update local state with saved data
        const updatedCompliances = complianceData.map((c) =>
          c.$id === editingCompliance.$id ? { ...c, ...updateData } : c
        );
        setComplianceData(updatedCompliances);
        setEditingCompliance(null);
      } else {
        console.error("No matching document found in FORMS_ID collection.");
      }
    } catch (error) {
      console.error("Error saving compliance data:", error);
    }
  };
  

  const handleDeleteCompliance = async () => {
    if (!editingCompliance) return;
    try {
      await databases.deleteDocument(STAGING_DATABASE_ID, ROC_ID, editingCompliance.$id);
      const updatedCompliances = complianceData.filter(c => c.$id !== editingCompliance.$id);
      setComplianceData(updatedCompliances);
      setEditingCompliance(null);
    } catch (error) {
      console.error("Error deleting compliance:", error);
    }
  };

  const handleAddComplianceData = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { query, yesNo, date } = newCompliance;
      // Fetch the document from FORMS_ID based on selected query
      const response = await databases.listDocuments(STAGING_DATABASE_ID, FORMS_ID, [
        Query.equal("query", query),
      ]);
  
      if (response.documents.length > 0) {
        const formDocument = response.documents[0];
        const yesNoValues = formDocument.yesNo; // Fetch yesNo attribute (array)
        // Set description based on Yes/No selection
        const description =
          yesNo === "Yes"
            ? yesNoValues[0] // Index 0 for Yes
            : yesNoValues[1]; // Index 1 for No
        // Update newCompliance with dynamically set description
        setNewCompliance({ ...newCompliance, description });
        // Save compliance data
        const saveResponse = await databases.createDocument(
          STAGING_DATABASE_ID,
          ROC_ID,
          "unique()",
          { query, yesNo, date, description, startupId }
        );
  
        setComplianceData([...complianceData, saveResponse]);
        setIsDialogOpen(false);
        setNewCompliance({
          query: "",
          yesNo: "",
          date: "",
          description: "",
        });
      } else {
        console.error("No matching document found in FORMS_ID collection.");
      }
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">ROC Compliance</h3>
        <PlusCircle onClick={() => setIsDialogOpen(true)} size={20} className="mr-2 mb-2 cursor-pointer" />
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>ROC Compliance Information</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Form Queries</TableHead>
              <TableHead>Yes/No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-1/3">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceData.map((row) => (
              <TableRow key={row.$id} onDoubleClick={() => setEditingCompliance(row)}>
                <TableCell>{row.query}</TableCell>
                <TableCell>{row.yesNo}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>Add New Compliance</DialogTitle>
            <DialogDescription aria-describedby={undefined}>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <div>
              <Label htmlFor="query" className="text-right">Form Query</Label>
              <Select
                value={newCompliance.query}
                onValueChange={(value) => setNewCompliance({ ...newCompliance, query: value })}
              >
                <SelectTrigger id="query" className="col-span-3">
                  <SelectValue placeholder="Select Form Query" />
                </SelectTrigger>
                <SelectContent>
                  {queryOptions.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yesNo" className="text-right">Yes/No</Label>
              <Select
                value={newCompliance.yesNo}
                onValueChange={(value) => setNewCompliance({ ...newCompliance, yesNo: value })}
              >
                <SelectTrigger id="yesNo" className="col-span-3">
                  <SelectValue placeholder="Select Yes/No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={newCompliance.date}
                onChange={(e) => setNewCompliance({ ...newCompliance, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={newCompliance.description}
                onChange={(e) => setNewCompliance({ ...newCompliance, description: e.target.value })}
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddComplianceData} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingCompliance && (
        <Dialog open={!!editingCompliance} onOpenChange={() => setEditingCompliance(null)}>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Edit Compliance</DialogTitle>
              <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
                <Label htmlFor="edit-query" className="text-right">Form Query</Label>
                <Select
    value={editingCompliance.query}
    onValueChange={(value) => setEditingCompliance({ ...editingCompliance, query: value })}
  >
    <SelectTrigger id="edit-query" className="col-span-3">
      <SelectValue placeholder="Edit Form Query" />
    </SelectTrigger>
    <SelectContent>
                  {queryOptions.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
  </Select>
              </div>
              <div>
                <Label htmlFor="edit-yesNo" className="text-right">Yes/No</Label>
                <Select
                  value={editingCompliance.yesNo}
                  onValueChange={(value) => setEditingCompliance({ ...editingCompliance, yesNo: value })}
                >
                  <SelectTrigger id="edit-yesNo" className="col-span-3">
                    <SelectValue placeholder="Select Yes/No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date" className="text-right">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingCompliance.date}
                  onChange={(e) => setEditingCompliance({ ...editingCompliance, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCompliance.description}
                  onChange={(e) => setEditingCompliance({ ...editingCompliance, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeleteCompliance} className="bg-white text-black border border-black hover:bg-neutral-200">Delete</Button>
              <Button onClick={handleSaveCompliance} className="mr-2">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RocCompliance;
