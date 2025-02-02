"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, Trash2Icon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TRANCHES_MILESTONES_ID = "6734996a00203a2aefbb";

interface TranchesMilestonesProps {
  startupId: string;
}

const TranchesMilestones: React.FC<TranchesMilestonesProps> = ({ startupId }) => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [newMilestone, setNewMilestone] = useState({
    trancheType: "",
    status: "",
    amount: "",
    milestones: "",
  });

  const client = useMemo(() => new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID), []);
  const databases = useMemo(() => new Databases(client), [client]);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, TRANCHES_MILESTONES_ID, [
          Query.equal("startupId", startupId),
        ]);
        setMilestones(response.documents);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };
    fetchMilestones();
  }, [databases, startupId]);

  const handleAddMilestone = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        TRANCHES_MILESTONES_ID,
        "unique()",
        { ...newMilestone, startupId }
      );
      setMilestones([...milestones, response]);
      setNewMilestone({
        trancheType: "",
        status: "",
        amount: "",
        milestones: "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const handleEditMilestone = async () => {
    if (!editingMilestone) return;
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = editingMilestone;
    try {
      await databases.updateDocument(DATABASE_ID, TRANCHES_MILESTONES_ID, $id, dataToUpdate);
      const updatedMilestones = milestones.map((m) => (m.$id === $id ? editingMilestone : m));
      setMilestones(updatedMilestones);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!editingMilestone) return;
    try {
      await databases.deleteDocument(DATABASE_ID, TRANCHES_MILESTONES_ID, editingMilestone.$id);
      const updatedMilestones = milestones.filter((m) => m.$id !== editingMilestone.$id);
      setMilestones(updatedMilestones);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error deleting milestone:", error);
    }
  };

  const totalAmount = milestones.reduce((sum, milestone) => {
    const amount = parseFloat(milestone.amount.replace(/₹|,/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Tranches & Milestones</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <PlusCircle size={20} className="cursor-pointer mb-2 mr-2" />
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>Add New Tranche & Milestone</DialogTitle>
              <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
              <Label>Tranche Type</Label>
              <Select
                value={newMilestone.trancheType}
                onValueChange={(value) => setNewMilestone({ ...newMilestone, trancheType: value })}
               >
                <SelectTrigger>
                  <SelectValue placeholder="Select Tranche Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tranche 1">Tranche 1</SelectItem>
                  <SelectItem value="Tranche 2">Tranche 2</SelectItem>
                  <SelectItem value="Tranche 3">Tranche 3</SelectItem>
                  <SelectItem value="Tranche 4">Tranche 4</SelectItem>
                  <SelectItem value="Tranche 5">Tranche 5</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={newMilestone.status}
                  onValueChange={(value) => setNewMilestone({ ...newMilestone, status: value })}
                >
                <SelectTrigger className="w-full text-sm p-2 border rounded">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Released">Released</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div>
              <Label>Amount</Label>
              <Input
                type="text"
                placeholder="Enter amount in INR"
                value={newMilestone.amount}
                onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                const formattedValue = new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(Number(rawValue) || 0);
                setNewMilestone({ ...newMilestone, amount: formattedValue });
                }}
              />

              </div>
              <div>
              <Label>Milestones</Label>
              <Textarea
                placeholder="Milestones"
                value={newMilestone.milestones}
                onChange={(e) => setNewMilestone({ ...newMilestone, milestones: e.target.value })}
              />
              </div>
            </div>
            <div className="flex justify-end">
            <Button onClick={handleAddMilestone}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of recent Tranches & Milestones.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Tranche Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount (As Per SHA)</TableHead>
              <TableHead className="w-96">Milestones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone) => (
              <TableRow
                key={milestone.$id}
                onDoubleClick={() => {
                  setEditingMilestone(milestone);
                  setIsEditDialogOpen(true);
                }}
              >
                <TableCell>{milestone.trancheType}</TableCell>
                <TableCell>{milestone.status}</TableCell>
                <TableCell>{milestone.amount}</TableCell>
                <TableCell>{milestone.milestones}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-gray-100">
              <TableCell colSpan={2} className="text-right">
                Total:
              </TableCell>
              <TableCell>₹{totalAmount.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>Edit Tranche & Milestone</DialogTitle>
            <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
          </DialogHeader>
          {editingMilestone && (
            <div className="grid grid-cols-4 gap-4 py-4">
              <div>
                <Label>Tranche Type</Label>
                <Select
                  value={editingMilestone.trancheType}
                  onValueChange={(value) => setEditingMilestone({ ...editingMilestone, trancheType: value })}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Select Tranche Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tranche 1">Tranche 1</SelectItem>
                  <SelectItem value="Tranche 2">Tranche 2</SelectItem>
                  <SelectItem value="Tranche 3">Tranche 3</SelectItem>
                  <SelectItem value="Tranche 4">Tranche 4</SelectItem>
                  <SelectItem value="Tranche 5">Tranche 5</SelectItem>
                </SelectContent>
                </Select>
                </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editingMilestone.status}
                  onValueChange={(value) => setEditingMilestone({ ...editingMilestone, status: value })}
                >
                <SelectTrigger className="w-full p-2 text-sm border rounded">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Released">Released</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div>
              <Label>Amount</Label>
              <Input
                type="text"
                placeholder="Enter amount in INR"
                value={editingMilestone.amount}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                  const formattedValue = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                    }).format(Number(rawValue) || 0);
                    setEditingMilestone({ ...editingMilestone, amount: formattedValue });
                    }}
              />

              </div>
              <div>
              <Label>Milestones</Label>
              <Textarea
                placeholder="Milestones"
                value={editingMilestone.milestones}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, milestones: e.target.value })}
              />
              </div>
            </div>
          )}
          <div className="flex space-x-3 justify-end">
            <Button onClick={handleDeleteMilestone} className="bg-white text-black border border-black hover:bg-neutral-200">
              Delete
            </Button>
            <Button onClick={handleEditMilestone}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TranchesMilestones;
