"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, Trash2Icon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <PlusCircle size={20} className="cursor-pointer mb-2" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tranche & Milestone</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Tranche Type"
                value={newMilestone.trancheType}
                onChange={(e) => setNewMilestone({ ...newMilestone, trancheType: e.target.value })}
              />
              <select
                value={newMilestone.status}
                onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Released">Released</option>
              </select>
              <Input
                placeholder="Amount"
                value={newMilestone.amount}
                onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
              />
              <Textarea
                placeholder="Milestones"
                value={newMilestone.milestones}
                onChange={(e) => setNewMilestone({ ...newMilestone, milestones: e.target.value })}
              />
            </div>
            <Button onClick={handleAddMilestone}>Save</Button>
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
              <TableCell colSpan={3} className="text-right">
                Total:
              </TableCell>
              <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tranche & Milestone</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Tranche Type"
                value={editingMilestone.trancheType}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, trancheType: e.target.value })}
              />
              <select
                value={editingMilestone.status}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, status: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Released">Released</option>
              </select>
              <Input
                placeholder="Amount"
                value={editingMilestone.amount}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, amount: e.target.value })}
              />
              <Textarea
                placeholder="Milestones"
                value={editingMilestone.milestones}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, milestones: e.target.value })}
              />
            </div>
          )}
          <div className="flex space-x-3 justify-end">
            <Button onClick={handleDeleteMilestone} variant="destructive">
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
