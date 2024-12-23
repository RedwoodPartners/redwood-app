"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, SaveIcon, Trash2Icon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Textarea } from "@/components/ui/textarea";

export const TRANCHES_MILESTONES_ID = "6734996a00203a2aefbb";

interface TranchesMilestonesProps {
  startupId: string;
}

const TranchesMilestones: React.FC<TranchesMilestonesProps> = ({ startupId }) => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    trancheType: "",
    status: "",
    amount: "",
    milestones: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchMilestones = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, TRANCHES_MILESTONES_ID, [
          Query.equal("startupId", startupId),
        ]);
        setMilestones(response.documents);
      } catch (error) {
        console.error("Error fetching investments:", error);
      }
    };
    fetchMilestones();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index][field] = value;
    setMilestones(updatedMilestones);
    setEditingIndex(index);
  };

  const handleSaveInvestment = async (index: number) => {
    const investment = milestones[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = investment;
    try {
      await databases.updateDocument(DATABASE_ID, TRANCHES_MILESTONES_ID, $id!, dataToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving investment:", error);
    }
  };

  const handleAddInvestment = async () => {
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
    } catch (error) {
      console.error("Error adding investment:", error);
    }
  };

  const handleDeleteInvestment = async (index: number) => {
    try {
      await databases.deleteDocument(DATABASE_ID, TRANCHES_MILESTONES_ID, milestones[index].$id!);
      const updatedMilestones = milestones.filter((_, i) => i !== index);
      setMilestones(updatedMilestones);
      setDeletingIndex(null);
    } catch (error) {
      console.error("Error deleting investment:", error);
    }
  };

  const totalAmount = milestones.reduce((sum, investment) => {
    const amount = parseFloat(investment.amount.replace(/₹|,/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Tranches & Milestones</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>A list of recent Tranches & Milestones.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Tranche Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount (As Per SHA)</TableHead>
            <TableHead>Milestones</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.map((investment, index) => (
            <TableRow key={investment.$id} onDoubleClick={() => setDeletingIndex(index)}>
              <TableCell>
                <input
                  type="text"
                  value={investment.trancheType}
                  onChange={(e) => handleEditChange(index, "trancheType", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <select
                  value={investment.status}
                  onChange={(e) => handleEditChange(index, "status", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none bg-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Released">Released</option>
                </select>
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={investment.amount}
                  onChange={(e) => handleEditChange(index, "amount", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={investment.milestones}
                  onChange={(e) => handleEditChange(index, "milestones", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {editingIndex === index && (
                  <button onClick={() => handleSaveInvestment(index)} className="text-black rounded-full transition">
                    <div className="relative group ml-3">
                      <SaveIcon size={20} className="cursor-pointer text-green-500" />
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Save
                      </span>
                    </div>
                  </button>
                )}
                {deletingIndex === index ? (
                  <div className="flex items-center space-x-2">
                    <span>Delete row?</span>
                    <button onClick={() => handleDeleteInvestment(index)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Yes
                    </button>
                    <button onClick={() => setDeletingIndex(null)} className="bg-gray-300 text-black px-2 py-1 rounded"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <input
                type="text"
                disabled
                value={newMilestone.trancheType}
                onChange={(e) => setNewMilestone({ ...newMilestone, trancheType: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Tranches Type"
              />
            </TableCell>
            <TableCell>
              <select
              disabled
                value={newMilestone.status}
                onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value })}
                className="w-full h-5 border-none focus:outline-none bg-transparent"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Released">Released</option>
              </select>
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newMilestone.amount}
                onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Amount"
              />
            </TableCell>
            <TableCell>
              <input
                disabled
                value={newMilestone.milestones}
                onChange={(e) => setNewMilestone({ ...newMilestone, milestones: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Milestones"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddInvestment} className="text-black rounded-full transition">
                <div className="relative group">
                  <PlusCircle size={20} />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                    Add Row
                  </span>
                </div>
              </button>
            </TableCell>
          </TableRow>
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={4} className="text-right">Total:</TableCell>
            <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default TranchesMilestones;
