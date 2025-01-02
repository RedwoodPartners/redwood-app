"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { Query } from "appwrite";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INCOME_TAX_TABLE_ID = "6736e636001bd105c8c8";

interface IncomeTaxComplianceProps {
  startupId: string;
}

const IncomeTaxCompliance: React.FC<IncomeTaxComplianceProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingCompliance, setEditingCompliance] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompliance, setNewCompliance] = useState({
    query: "",
    yesNo: "",
    date: "",
    description: "",
  });

  const { client, databases } = useMemo(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    return { client, databases };
  }, []);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, INCOME_TAX_TABLE_ID, [
          Query.equal("startupId", startupId),
        ]);
        const filteredDocuments = response.documents.map(doc => {
          const { $id, query, yesNo, date, description } = doc;
          return { $id, query, yesNo, date, description };
        });
        setComplianceData(filteredDocuments);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };
    fetchComplianceData();
  }, [startupId, databases]);

  const handleSaveCompliance = async () => {
    if (!editingCompliance) return;
    try {
      const allowedFields = ['query', 'yesNo', 'date', 'description'];
      const updateData = Object.fromEntries(
        Object.entries(editingCompliance).filter(([key]) => allowedFields.includes(key))
      );
      await databases.updateDocument(DATABASE_ID, INCOME_TAX_TABLE_ID, editingCompliance.$id, updateData);
      const updatedCompliances = complianceData.map(c => c.$id === editingCompliance.$id ? {...c, ...updateData} : c);
      setComplianceData(updatedCompliances);
      setEditingCompliance(null);
    } catch (error) {
      console.error("Error saving compliance data:", error);
    }
  };

  const handleDeleteCompliance = async () => {
    if (!editingCompliance) return;
    try {
      await databases.deleteDocument(DATABASE_ID, INCOME_TAX_TABLE_ID, editingCompliance.$id);
      const updatedCompliances = complianceData.filter(c => c.$id !== editingCompliance.$id);
      setComplianceData(updatedCompliances);
      setEditingCompliance(null);
    } catch (error) {
      console.error("Error deleting compliance:", error);
    }
  };

  const handleAddComplianceData = async () => {
    try {
      const { query, yesNo, date, description } = newCompliance;
      const response = await databases.createDocument(
        DATABASE_ID,
        INCOME_TAX_TABLE_ID,
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
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Income Tax Compliance</h3>
        <PlusCircle onClick={() => setIsDialogOpen(true)} size={20} className="mr-2 mb-2 cursor-pointer" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>Add New Compliance</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <div>
              <Label htmlFor="query" className="text-right">Form Query</Label>
              <Textarea id="query" value={newCompliance.query} onChange={(e) => setNewCompliance({ ...newCompliance, query: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="yesNo" className="text-right">Yes/No</Label>
              <Select value={newCompliance.yesNo} onValueChange={(value) => setNewCompliance({ ...newCompliance, yesNo: value })}>
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
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={newCompliance.date} onChange={(e) => setNewCompliance({ ...newCompliance, date: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={newCompliance.description} onChange={(e) => setNewCompliance({ ...newCompliance, description: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddComplianceData}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingCompliance && (
        <Dialog open={!!editingCompliance} onOpenChange={() => setEditingCompliance(null)}>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Edit Compliance</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
                <Label htmlFor="edit-query" className="text-right">Form Query</Label>
                <Textarea id="edit-query" value={editingCompliance.query} onChange={(e) => setEditingCompliance({ ...editingCompliance, query: e.target.value })} className="col-span-3" />
              </div>
              <div>
                <Label htmlFor="edit-yesNo" className="text-right">Yes/No</Label>
                <Select value={editingCompliance.yesNo} onValueChange={(value) => setEditingCompliance({ ...editingCompliance, yesNo: value })}>
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
                <Label htmlFor="edit-date" className="text-right">Date</Label>
                <Input id="edit-date" type="date" value={editingCompliance.date} onChange={(e) => setEditingCompliance({ ...editingCompliance, date: e.target.value })} className="col-span-3" />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea id="edit-description" value={editingCompliance.description} onChange={(e) => setEditingCompliance({ ...editingCompliance, description: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeleteCompliance} variant="destructive">Delete</Button>
              <Button onClick={handleSaveCompliance} className="mr-2">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IncomeTaxCompliance;
