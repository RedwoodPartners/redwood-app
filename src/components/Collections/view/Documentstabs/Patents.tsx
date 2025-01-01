"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, SaveIcon, Trash2Icon } from "lucide-react";
import { Query } from "appwrite";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PATENTS_ID = "673add4700120ef26d13";

interface PatentsProps {
  startupId: string;
}

const Patents: React.FC<PatentsProps> = ({ startupId }) => {
  const [patentsData, setPatentsData] = useState<any[]>([]);
  const [editingPatent, setEditingPatent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPatent, setNewPatent] = useState({
    patent: "",
    inventors: "",
    date: "",
    status: "",
    patentNumber: "",
    approvalDate: "",
    expiryDate: "",
    patentOffice: "",
    description: "",
  });

  const { client, databases } = useMemo(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    return { client, databases };
  }, []);

  useEffect(() => {
    const fetchPatentsData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PATENTS_ID, [
          Query.equal("startupId", startupId),
        ]);
        setPatentsData(response.documents);
      } catch (error) {
        console.error("Error fetching patents data:", error);
      }
    };
    fetchPatentsData();
  }, [startupId, databases]);

  const handleSavePatent = async () => {
    if (!editingPatent) return;

    try {
      await databases.updateDocument(DATABASE_ID, PATENTS_ID, editingPatent.$id, editingPatent);
      const updatedPatents = patentsData.map(p => p.$id === editingPatent.$id ? editingPatent : p);
      setPatentsData(updatedPatents);
      setEditingPatent(null);
    } catch (error) {
      console.error("Error saving patent data:", error);
    }
  };

  const handleDeletePatent = async () => {
    if (!editingPatent) return;

    try {
      await databases.deleteDocument(DATABASE_ID, PATENTS_ID, editingPatent.$id);
      const updatedPatents = patentsData.filter(p => p.$id !== editingPatent.$id);
      setPatentsData(updatedPatents);
      setEditingPatent(null);
    } catch (error) {
      console.error("Error deleting patent:", error);
    }
  };

  const handleAddPatentsData = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        PATENTS_ID,
        "unique()",
        { ...newPatent, startupId }
      );
      setPatentsData([...patentsData, response]);
      setIsDialogOpen(false);
      setNewPatent({
        patent: "",
        inventors: "",
        date: "",
        status: "",
        patentNumber: "",
        approvalDate: "",
        expiryDate: "",
        patentOffice: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding patents data:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Patents</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Patent
        </Button>
      </div>

      <Table className="border border-gray-300 shadow-lg bg-white">
        <TableCaption>Patents Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Patent Name</TableHead>
            <TableHead>Inventors</TableHead>
            <TableHead>Filed Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Application/Patent Number</TableHead>
            <TableHead>Approval Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Patent Office</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patentsData.map((row) => (
            <TableRow key={row.$id} onDoubleClick={() => setEditingPatent(row)}>
              <TableCell>{row.patent}</TableCell>
              <TableCell>{row.inventors}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.patentNumber}</TableCell>
              <TableCell>{row.approvalDate}</TableCell>
              <TableCell>{row.expiryDate}</TableCell>
              <TableCell>{row.patentOffice}</TableCell>
              <TableCell>{row.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="patent" className="text-right">Patent Name</label>
              <Input id="patent" value={newPatent.patent} onChange={(e) => setNewPatent({ ...newPatent, patent: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="inventors" className="text-right">Inventors</label>
              <Input id="inventors" value={newPatent.inventors} onChange={(e) => setNewPatent({ ...newPatent, inventors: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">Filed Date</label>
              <Input id="date" type="date" value={newPatent.date} onChange={(e) => setNewPatent({ ...newPatent, date: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">Status</label>
              <select id="status" value={newPatent.status} onChange={(e) => setNewPatent({ ...newPatent, status: e.target.value })} className="col-span-3">
                <option value="">Select Status</option>
                <option value="Filed">Filed</option>
                <option value="Published">Published</option>
                <option value="Granted">Granted</option>
                <option value="Refused">Refused</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="patentNumber" className="text-right">Patent Number</label>
              <Input id="patentNumber" value={newPatent.patentNumber} onChange={(e) => setNewPatent({ ...newPatent, patentNumber: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="approvalDate" className="text-right">Approval Date</label>
              <Input id="approvalDate" type="date" value={newPatent.approvalDate} onChange={(e) => setNewPatent({ ...newPatent, approvalDate: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="expiryDate" className="text-right">Expiry Date</label>
              <Input id="expiryDate" type="date" value={newPatent.expiryDate} onChange={(e) => setNewPatent({ ...newPatent, expiryDate: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="patentOffice" className="text-right">Patent Office</label>
              <Input id="patentOffice" value={newPatent.patentOffice} onChange={(e) => setNewPatent({ ...newPatent, patentOffice: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">Description</label>
              <Textarea id="description" value={newPatent.description} onChange={(e) => setNewPatent({ ...newPatent, description: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddPatentsData}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingPatent && (
        <Dialog open={!!editingPatent} onOpenChange={() => setEditingPatent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Patent</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-patent" className="text-right">Patent Name</label>
                <Input
                  id="edit-patent"
                  value={editingPatent.patent}
                  onChange={(e) => setEditingPatent({ ...editingPatent, patent: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-inventors" className="text-right">Inventors</label>
                <Input
                  id="edit-inventors"
                  value={editingPatent.inventors}
                  onChange={(e) => setEditingPatent({ ...editingPatent, inventors: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-date" className="text-right">Filed Date</label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingPatent.date}
                  onChange={(e) => setEditingPatent({ ...editingPatent, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-status" className="text-right">Status</label>
                <select
                  id="edit-status"
                  value={editingPatent.status}
                  onChange={(e) => setEditingPatent({ ...editingPatent, status: e.target.value })}
                  className="col-span-3"
                >
                  <option value="Filed">Filed</option>
                  <option value="Published">Published</option>
                  <option value="Granted">Granted</option>
                  <option value="Refused">Refused</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-patentNumber" className="text-right">Patent Number</label>
                <Input
                  id="edit-patentNumber"
                  value={editingPatent.patentNumber}
                  onChange={(e) => setEditingPatent({ ...editingPatent, patentNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-approvalDate" className="text-right">Approval Date</label>
                <Input
                  id="edit-approvalDate"
                  type="date"
                  value={editingPatent.approvalDate}
                  onChange={(e) => setEditingPatent({ ...editingPatent, approvalDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-expiryDate" className="text-right">Expiry Date</label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={editingPatent.expiryDate}
                  onChange={(e) => setEditingPatent({ ...editingPatent, expiryDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-patentOffice" className="text-right">Patent Office</label>
                <Input
                  id="edit-patentOffice"
                  value={editingPatent.patentOffice}
                  onChange={(e) => setEditingPatent({ ...editingPatent, patentOffice: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-description" className="text-right">Description</label>
                <Textarea
                  id="edit-description"
                  value={editingPatent.description}
                  onChange={(e) => setEditingPatent({ ...editingPatent, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSavePatent} className="mr-2">
                <SaveIcon className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button onClick={handleDeletePatent} variant="destructive">
                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Patents;
