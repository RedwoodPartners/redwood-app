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
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { Query } from "appwrite";
import { STAGING_DATABASE_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMS_ID } from "./ROCcompliance";
import ButtonWithIcon from "@/lib/addButton";

const GST_ID = "6739ce42002b5b5036a8";

interface GstComplianceProps {
  startupId: string;
}

const GstCompliance: React.FC<GstComplianceProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingCompliance, setEditingCompliance] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompliance, setNewCompliance] = useState({
    query: "",
    yesNo: "",
    date: "",
    description: "",
  });

  const [queryOptions, setQueryOptions] = useState<string[]>([]);
  const [natureOfCompany, setNatureOfCompany] = useState<string>("all");
  const [formsData, setFormsData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          GST_ID,
          [Query.equal("startupId", startupId)]
        );
        const filteredDocuments = response.documents.map((doc) => {
          const { $id, query, yesNo, date, description } = doc;
          return { $id, query, yesNo, date, description };
        });
        setComplianceData(filteredDocuments);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };
    fetchComplianceData();
  }, [startupId]);

  // Fetch dynamic query options
  useEffect(() => {
    const fetchQueryOptions = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          FORMS_ID,
          [Query.equal("natureOfCompany", "all")]
        );
        const options = response.documents.map((doc) => doc.query);
        setQueryOptions(options);
        setFormsData(response.documents);
      } catch (error) {
        console.error("Error fetching query options:", error);
      }
    };
    fetchQueryOptions();
  }, [natureOfCompany]);

  // Function to get description based on yesNo value
  const getDescriptionForYesNo = (yesNoValue: string, queryValue: string): string => {
    const formData = formsData.find((doc) => doc.query === queryValue);
    if (formData && formData.yesNo && Array.isArray(formData.yesNo) && formData.yesNo.length > 0) {
      const index = yesNoValue === 'yes' ? 0 : 1;
      return formData.yesNo[index] || ''; // Return corresponding description
    }
    return '';
  };

  const handleSaveCompliance = async () => {
    if (!editingCompliance) return;
    try {
      const allowedFields = ["query", "yesNo", "date", "description"];
      const updateData = Object.fromEntries(
        Object.entries(editingCompliance).filter(([key]) =>
          allowedFields.includes(key)
        )
      );
      await databases.updateDocument(
        STAGING_DATABASE_ID,
        GST_ID,
        editingCompliance.$id,
        updateData
      );
      const updatedCompliances = complianceData.map((c) =>
        c.$id === editingCompliance.$id ? { ...c, ...updateData } : c
      );
      setComplianceData(updatedCompliances);
      setEditingCompliance(null);
    } catch (error) {
      console.error("Error saving compliance data:", error);
    }
  };

  const handleDeleteCompliance = async () => {
    if (!editingCompliance) return;
    try {
      await databases.deleteDocument(
        STAGING_DATABASE_ID,
        GST_ID,
        editingCompliance.$id
      );
      const updatedCompliances = complianceData.filter(
        (c) => c.$id !== editingCompliance.$id
      );
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
      const { query, yesNo, date, description } = newCompliance;
      const response = await databases.createDocument(
        STAGING_DATABASE_ID,
        GST_ID,
        "unique()",
        { query, yesNo, date, description, startupId }
      );
      setComplianceData([...complianceData, response]);
      setIsDialogOpen(false);
      setNewCompliance({
        query: "",
        yesNo: "",
        date: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYesNoChange = (value: string) => {
    const description = getDescriptionForYesNo(value, newCompliance.query);
    setNewCompliance({
      ...newCompliance,
      yesNo: value,
      description: description,
    });
  };

  const handleEditYesNoChange = (value: string) => {
    if (editingCompliance) {
      const description = getDescriptionForYesNo(value, editingCompliance.query);
      setEditingCompliance({
        ...editingCompliance,
        yesNo: value,
        description: description,
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">
          GST Compliance
        </h3>
        <ButtonWithIcon label="Add" onClick={() => setIsDialogOpen(true)} />
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>GST Compliance Information</TableCaption>
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
              <TableRow
                key={row.$id}
                onDoubleClick={() => setEditingCompliance(row)}
              >
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
            <DialogDescription aria-describedby={undefined}></DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <div>
              <Label htmlFor="query" className="text-right">
                Form Query
              </Label>
              <Select
                value={newCompliance.query}
                onValueChange={(value) =>
                  setNewCompliance({ ...newCompliance, query: value })
                }
              >
                <SelectTrigger id="query" className="col-span-3">
                  <SelectValue placeholder="Select a query" />
                </SelectTrigger>
                <SelectContent>
                  {queryOptions.length > 0 ? (
                    queryOptions.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))
                  ) : (
                    <p>error</p>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yesNo" className="text-right">
                Yes/No
              </Label>
              <Select
                value={newCompliance.yesNo}
                onValueChange={handleYesNoChange}
              >
                <SelectTrigger id="yesNo" className="col-span-3">
                  <SelectValue placeholder="Select Yes/No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newCompliance.date}
                onChange={(e) =>
                  setNewCompliance({ ...newCompliance, date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newCompliance.description}
                onChange={(e) =>
                  setNewCompliance({
                    ...newCompliance,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
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
        <Dialog
          open={!!editingCompliance}
          onOpenChange={() => setEditingCompliance(null)}
        >
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Edit Compliance</DialogTitle>
              <DialogDescription aria-describedby={undefined}></DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
                <Label htmlFor="edit-query" className="text-right">
                  Form Query
                </Label>
                <Textarea
                  id="edit-query"
                  value={editingCompliance.query}
                  onChange={(e) =>
                    setEditingCompliance({
                      ...editingCompliance,
                      query: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-yesNo" className="text-right">
                  Yes/No
                </Label>
                <Select
                  value={editingCompliance.yesNo}
                  onValueChange={handleEditYesNoChange}
                >
                  <SelectTrigger id="edit-yesNo" className="col-span-3">
                    <SelectValue placeholder="Select Yes/No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingCompliance.date}
                  onChange={(e) =>
                    setEditingCompliance({
                      ...editingCompliance,
                      date: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingCompliance.description}
                  onChange={(e) =>
                    setEditingCompliance({
                      ...editingCompliance,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleDeleteCompliance}
                className="bg-white text-black border border-black hover:bg-neutral-200"
              >
                Delete
              </Button>
              <Button onClick={handleSaveCompliance} className="mr-2">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GstCompliance;
