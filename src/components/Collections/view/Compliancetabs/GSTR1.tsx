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
import { Query } from "appwrite";
import { STAGING_DATABASE_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ButtonWithIcon from "@/lib/addButton";

const GSTR_ID = "673b1988001c3d93380e";

interface GstrComplianceProps {
  startupId: string;
  setIsDirty: (isDirty: boolean) => void;
}

const GstrCompliance: React.FC<GstrComplianceProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingCompliance, setEditingCompliance] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompliance, setNewCompliance] = useState({
    date: "",
    gstr1: "",
    gst3b: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, GSTR_ID, [
          Query.equal("startupId", startupId),
        ]);
        const filteredDocuments = response.documents.map(doc => {
          const { $id, date, gstr1, gst3b } = doc;
          const gstr1Value = parseFloat(gstr1.replace(/,/g, ''));
          const gst3bValue = parseFloat(gst3b.replace(/,/g, ''));
          const difference = (gstr1Value - gst3bValue).toFixed(2);
          return { $id, date, gstr1, gst3b, difference };
        });
        setComplianceData(filteredDocuments);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };
    fetchComplianceData();
  }, [startupId]);

  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSaveCompliance = async () => {
    if (!editingCompliance) return;
    try {
      const { date, gstr1, gst3b } = editingCompliance;
      const gstr1Value = parseFloat(gstr1.replace(/,/g, ''));
      const gst3bValue = parseFloat(gst3b.replace(/,/g, ''));
      const difference = (gstr1Value - gst3bValue).toFixed(2);

      const updateData = { 
        date, 
        gstr1: formatNumber(gstr1), 
        gst3b: formatNumber(gst3b), 
        difference: formatNumber(difference) 
      };
      await databases.updateDocument(STAGING_DATABASE_ID, GSTR_ID, editingCompliance.$id, updateData);
      const updatedCompliances = complianceData.map(c => 
        c.$id === editingCompliance.$id ? {...c, ...updateData} : c
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
      await databases.deleteDocument(STAGING_DATABASE_ID, GSTR_ID, editingCompliance.$id);
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
      const { date, gstr1, gst3b } = newCompliance;
      const gstr1Value = parseFloat(gstr1.replace(/,/g, ''));
      const gst3bValue = parseFloat(gst3b.replace(/,/g, ''));
      const difference = (gstr1Value - gst3bValue).toFixed(2);

      const response = await databases.createDocument(
        STAGING_DATABASE_ID,
        GSTR_ID,
        "unique()",
        { 
          date, 
          gstr1: formatNumber(gstr1), 
          gst3b: formatNumber(gst3b), 
          difference: formatNumber(difference), 
          startupId 
        }
      );
      setComplianceData([...complianceData, response]);
      setIsDialogOpen(false);
      setNewCompliance({
        date: "",
        gstr1: "",
        gst3b: "",
      });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let value = e.target.value.replace(/[^\d,]/g, '');
    value = formatNumber(value.replace(/,/g, ''));
    setNewCompliance({ ...newCompliance, [field]: value });
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">GSTR-1 & GSTR-3B</h3>
        <ButtonWithIcon onClick={() => setIsDialogOpen(true)} label="Add" />
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>GSTR Compliance Information</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>GST R1</TableHead>
              <TableHead>GST 3B</TableHead>
              <TableHead>Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceData.map((row) => (
              <TableRow key={row.$id} onDoubleClick={() => setEditingCompliance(row)}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.gstr1}</TableCell>
                <TableCell>{row.gst3b}</TableCell>
                <TableCell>{row.difference}</TableCell>
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
          <div className="grid grid-cols-3 gap-4 py-4">
            <div>
              <Label htmlFor="date" className="text-right">Month</Label>
              <Input
                id="date"
                type="date"
                value={newCompliance.date}
                onChange={(e) => setNewCompliance({ ...newCompliance, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="gstr1" className="text-right">GST R1</Label>
              <Input
                id="gstr1"
                value={newCompliance.gstr1}
                onChange={(e) => handleInputChange(e, 'gstr1')}
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="gst3b" className="text-right">GST 3B</Label>
              <Input
                id="gst3b"
                value={newCompliance.gst3b}
                onChange={(e) => handleInputChange(e, 'gst3b')}
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
        <Dialog open={!!editingCompliance} onOpenChange={() => setEditingCompliance(null)}>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Edit Compliance</DialogTitle>
              <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              <div>
                <Label htmlFor="edit-date" className="text-right">Month</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingCompliance.date}
                  onChange={(e) => setEditingCompliance({ ...editingCompliance, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-gstr1" className="text-right">GST R1</Label>
                <Input
                  id="edit-gstr1"
                  value={editingCompliance.gstr1}
                  onChange={(e) => setEditingCompliance({ ...editingCompliance, gstr1: formatNumber(e.target.value.replace(/[^\d,]/g, '').replace(/,/g, '')) })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-gst3b" className="text-right">GST 3B</Label>
                <Input
                  id="edit-gst3b"
                  value={editingCompliance.gst3b}
                  onChange={(e) => setEditingCompliance({ ...editingCompliance, gst3b: formatNumber(e.target.value.replace(/[^\d,]/g, '').replace(/,/g, '')) })}
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

export default GstrCompliance;
