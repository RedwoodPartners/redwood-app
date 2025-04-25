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
import { Query } from "appwrite";
import { STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
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

const INCOME_TAX_TABLE_ID = "6736e636001bd105c8c8";

interface IncomeTaxComplianceProps {
  startupId: string;
  setIsDirty: (isDirty: boolean) => void;
}

const IncomeTaxCompliance: React.FC<IncomeTaxComplianceProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingCompliance, setEditingCompliance] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [queryOptions, setQueryOptions] = useState<string[]>([]);
  const [natureOfCompany, setNatureOfCompany] = useState<string>("");
  const [formsData, setFormsData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, INCOME_TAX_TABLE_ID, [
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
        );
        setNatureOfCompany(startupResponse.natureOfCompany);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };
    fetchComplianceData();
  }, [startupId]);

  useEffect(() => {
    const fetchQueryOptions = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, FORMS_ID, [
          Query.equal("natureOfCompany", natureOfCompany),
          Query.equal("types", "it"),
        ]);
        const documents = response.documents;
        const options = documents.map((doc) => doc.query);
        setQueryOptions(options);
        setFormsData(documents);
      } catch (error) {
        console.error("Error fetching query options:", error);
      }
    };
    fetchQueryOptions();
  }, [natureOfCompany]);

  const getDescriptionForYesNo = (yesNoValue: string, queryValue: string): string => {
    const formData = formsData.find((doc) => doc.query === queryValue);
    if (formData && formData.yesNo && Array.isArray(formData.yesNo) && formData.yesNo.length > 0) {
      const index = yesNoValue === 'Yes' ? 0 : 1;
      return formData.yesNo[index] || '';
    }
    return '';
  };

  const handleSaveCompliance = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!editingCompliance) return;
    try {
      const allowedFields = ["query", "yesNo", "date", "description"];
      const updateData = Object.fromEntries(
        Object.entries(editingCompliance).filter(([key]) =>
          allowedFields.includes(key)
        )
      );
      await databases.updateDocument(STAGING_DATABASE_ID, INCOME_TAX_TABLE_ID, editingCompliance.$id, updateData);
      const updatedCompliances = complianceData.map(c => c.$id === editingCompliance.$id ? { ...c, ...updateData } : c);
      setComplianceData(updatedCompliances);
      setEditingCompliance(null);
    } catch (error) {
      console.error("Error saving compliance data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompliance = async () => {
    if (!editingCompliance) return;
    try {
      await databases.deleteDocument(STAGING_DATABASE_ID, INCOME_TAX_TABLE_ID, editingCompliance.$id);
      const updatedCompliances = complianceData.filter(c => c.$id !== editingCompliance.$id);
      setComplianceData(updatedCompliances);
      setEditingCompliance(null);
    } catch (error) {
      console.error("Error deleting compliance:", error);
    }
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

  const handleGenerateDocuments = async () => {
    if (!queryOptions.length) {
      console.warn("No query options available to generate documents.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Identify missing documents
      const missing = queryOptions.filter(
        (query) => !complianceData.some((doc) => doc.query === query)
      );
      setMissingDocuments(missing);

      for (const query of missing) {
        const defaultYesNo = "";
        const defaultDate = "";
        const defaultDescription = "";

        await databases.createDocument(
          STAGING_DATABASE_ID,
          INCOME_TAX_TABLE_ID,
          "unique()",
          {
            startupId: startupId,
            query: query,
            yesNo: defaultYesNo,
            date: defaultDate,
            description: defaultDescription,
          }
        );
      }

      // After generating documents, refresh the compliance data
      const fetchComplianceData = async () => {
        try {
          const response = await databases.listDocuments(STAGING_DATABASE_ID, INCOME_TAX_TABLE_ID, [
            Query.equal("startupId", startupId),
          ]);
          const filteredDocuments = response.documents.map((doc) => {
            const { $id, query, yesNo, date, description } = doc;
            return { $id, query, yesNo, date, description };
          });
          setComplianceData(filteredDocuments);
        } catch (error) {
          console.error("Error fetching compliance data:", error);
        }
      };
      await fetchComplianceData();

      console.log("Documents generated successfully.");
    } catch (error) {
      console.error("Error generating documents:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if all documents are created
  const allDocumentsCreated =
    queryOptions.length > 0 &&
    queryOptions.every((query) =>
      complianceData.some((doc) => doc.query === query)
    );


  return (
    <div>
      <div className="flex items-center space-x-2 p-2">
        <h3 className="text-lg font-medium">Income Tax Compliance</h3>
        {!allDocumentsCreated && (
            <Button
              onClick={handleGenerateDocuments}
              disabled={isSubmitting}
              variant={"outline"}
            >
              {isSubmitting ? "Generating..." : "Generate Documents"}
            </Button>
          )}
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>Income Tax Compliance Information</TableCaption>
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

      {editingCompliance && (
        <Dialog open={!!editingCompliance} onOpenChange={() => setEditingCompliance(null)}>
          <DialogContent className="w-full max-w-5xl">
            <DialogHeader>
              {editingCompliance.query && (
                <DialogTitle>
                  {editingCompliance.query}
                </DialogTitle>
              )}
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
                <Label htmlFor="edit-yesNo" className="text-right">Yes/No</Label>
                <Select value={editingCompliance.yesNo}
                  onValueChange={handleEditYesNoChange}>
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
                max={new Date().toISOString().split("T")[0]}  
                value={editingCompliance.date} onChange={(e) => setEditingCompliance({ ...editingCompliance, date: e.target.value })} className="col-span-3" />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea id="edit-description" value={editingCompliance.description} onChange={(e) => setEditingCompliance({ ...editingCompliance, description: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeleteCompliance} className="bg-white text-black border border-black hover:bg-neutral-200">Delete</Button>
              <Button onClick={handleSaveCompliance} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IncomeTaxCompliance;
