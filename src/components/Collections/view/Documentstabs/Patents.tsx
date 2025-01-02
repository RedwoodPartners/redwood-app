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
        const filteredDocuments = response.documents.map(doc => {
          const { $id, patent, inventors, date, status, patentNumber, approvalDate, expiryDate, patentOffice, description } = doc;
          return { $id, patent, inventors, date, status, patentNumber, approvalDate, expiryDate, patentOffice, description };
        });
        setPatentsData(filteredDocuments);
      } catch (error) {
        console.error("Error fetching patents data:", error);
      }
    };
    fetchPatentsData();
  }, [startupId, databases]);
  

  const handleSavePatent = async () => {
    if (!editingPatent) return;
    try {
      const allowedFields = ['patent', 'inventors', 'date', 'status', 'patentNumber', 'approvalDate', 'expiryDate', 'patentOffice', 'description'];
      const updateData = Object.fromEntries(
        Object.entries(editingPatent).filter(([key]) => allowedFields.includes(key))
      );
      
      await databases.updateDocument(DATABASE_ID, PATENTS_ID, editingPatent.$id, updateData);
      
      const updatedPatents = patentsData.map(p => p.$id === editingPatent.$id ? {...p, ...updateData} : p);
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
      const { patent, inventors, date, status, patentNumber, approvalDate, expiryDate, patentOffice, description } = newPatent;
      const response = await databases.createDocument(
        DATABASE_ID,
        PATENTS_ID,
        "unique()",
        { patent, inventors, date, status, patentNumber, approvalDate, expiryDate, patentOffice, description, startupId }
      );
      setPatentsData([...patentsData, response]);
      setIsDialogOpen(false);
      setNewPatent({
        patent: "", inventors: "", date: "", status: "", patentNumber: "", approvalDate: "", expiryDate: "", patentOffice: "", description: "",
      });
    } catch (error) {
      console.error("Error adding patents data:", error);
    }
  };
  

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Patents</h3>
          <PlusCircle onClick={() => setIsDialogOpen(true)} size={20} className="mr-2 mb-2 cursor-pointer" />
      </div>

      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
      <Table>
        <TableCaption>Patents Information</TableCaption>
        <TableHeader>
          <TableRow>
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>Add New Patent</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <div>
              <Label htmlFor="patent" className="text-right">Patent Name</Label>
              <Input id="patent" value={newPatent.patent} onChange={(e) => setNewPatent({ ...newPatent, patent: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="inventors" className="text-right">Inventors</Label>
              <Input id="inventors" value={newPatent.inventors} onChange={(e) => setNewPatent({ ...newPatent, inventors: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="date" className="text-right">Filed Date</Label>
              <Input id="date" type="date" value={newPatent.date} onChange={(e) => setNewPatent({ ...newPatent, date: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                value={newPatent.status}
                onValueChange={(value) => setNewPatent({ ...newPatent, status: value })}
              >
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filed">Filed</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Granted">Granted</SelectItem>
                <SelectItem value="Refused">Refused</SelectItem>
              </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="patentNumber" className="text-right">Patent Number</Label>
              <Input id="patentNumber" value={newPatent.patentNumber} onChange={(e) => setNewPatent({ ...newPatent, patentNumber: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="approvalDate" className="text-right">Approval Date</Label>
              <Input id="approvalDate" type="date" value={newPatent.approvalDate} onChange={(e) => setNewPatent({ ...newPatent, approvalDate: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
              <Input id="expiryDate" type="date" value={newPatent.expiryDate} onChange={(e) => setNewPatent({ ...newPatent, expiryDate: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="patentOffice" className="text-right">Patent Office</Label>
              <Input id="patentOffice" value={newPatent.patentOffice} onChange={(e) => setNewPatent({ ...newPatent, patentOffice: e.target.value })} className="col-span-3" />
            </div>
            <div>
              <Label htmlFor="description" className="text-right">Description</Label>
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
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Edit Patent</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
                <Label htmlFor="edit-patent" className="text-right">Patent Name</Label>
                <Input
                  id="edit-patent"
                  value={editingPatent.patent}
                  onChange={(e) => setEditingPatent({ ...editingPatent, patent: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-inventors" className="text-right">Inventors</Label>
                <Input
                  id="edit-inventors"
                  value={editingPatent.inventors}
                  onChange={(e) => setEditingPatent({ ...editingPatent, inventors: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-date" className="text-right">Filed Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingPatent.date}
                  onChange={(e) => setEditingPatent({ ...editingPatent, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select
                  value={editingPatent.status}
                  onValueChange={(value) => setEditingPatent({ ...editingPatent, status: value })}
                >
                <SelectTrigger id="edit-status" className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Filed">Filed</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Granted">Granted</SelectItem>
                  <SelectItem value="Refused">Refused</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-patentNumber" className="text-right">Patent Number</Label>
                <Input
                  id="edit-patentNumber"
                  value={editingPatent.patentNumber}
                  onChange={(e) => setEditingPatent({ ...editingPatent, patentNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-approvalDate" className="text-right">Approval Date</Label>
                <Input
                  id="edit-approvalDate"
                  type="date"
                  value={editingPatent.approvalDate}
                  onChange={(e) => setEditingPatent({ ...editingPatent, approvalDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-expiryDate" className="text-right">Expiry Date</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={editingPatent.expiryDate}
                  onChange={(e) => setEditingPatent({ ...editingPatent, expiryDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-patentOffice" className="text-right">Patent Office</Label>
                <Input
                  id="edit-patentOffice"
                  value={editingPatent.patentOffice}
                  onChange={(e) => setEditingPatent({ ...editingPatent, patentOffice: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingPatent.description}
                  onChange={(e) => setEditingPatent({ ...editingPatent, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeletePatent} variant="destructive">Delete</Button>
              <Button onClick={handleSavePatent} className="mr-2">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Patents;
