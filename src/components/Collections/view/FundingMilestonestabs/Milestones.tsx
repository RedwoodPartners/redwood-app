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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import ButtonWithIcon from "@/lib/addButton";

export const TRANCHES_MILESTONES_ID = "6734996a00203a2aefbb";

interface TrancheMilestone {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  startupId?: string;
  trancheType: string;
  status: string;
  amount: string;
  milestones: string;
  date: string;
  noteMilestones: string;
}

const defaultMilestone: TrancheMilestone = {
  trancheType: "",
  status: "",
  amount: "",
  milestones: "",
  date: "",
  noteMilestones: "",
};

const TranchesMilestones: React.FC<{ startupId: string }> = ({ startupId }) => {
  const [milestones, setMilestones] = useState<TrancheMilestone[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [currentMilestone, setCurrentMilestone] =
    useState<TrancheMilestone>(defaultMilestone);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          TRANCHES_MILESTONES_ID,
          [Query.equal("startupId", startupId)]
        );

        // Map Appwrite documents to TrancheMilestone objects
        const fetchedMilestones: TrancheMilestone[] = response.documents.map(
          (doc: any) => ({
            $id: doc.$id,
            $createdAt: doc.$createdAt,
            $updatedAt: doc.$updatedAt,
            startupId: doc.startupId,
            trancheType: doc.trancheType,
            status: doc.status,
            amount: doc.amount,
            milestones: doc.milestones,
            date: doc.date,
            noteMilestones: doc.noteMilestones,
          })
        );
        setMilestones(fetchedMilestones);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };
    fetchMilestones();
  }, [startupId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentMilestone((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof TrancheMilestone,
    value: string
  ) => {
    setCurrentMilestone((prev) => ({ ...prev, [name]: value }));
  };

  const formatCurrencyInput = (value: string) => {
    const rawValue = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(rawValue) || 0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrencyInput(e.target.value);
    setCurrentMilestone((prev) => ({ ...prev, amount: formattedValue }));
    setAmountError("");
  };

  const validateAmount = (amount: string) => {
    return !amount.trim();
  };

  const handleSaveMilestone = async () => {
    if (validateAmount(currentMilestone.amount)) {
      setAmountError("Amount is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && currentMilestone.$id) {
        const { $id, ...dataToUpdate } = currentMilestone;
        await databases.updateDocument(
          STAGING_DATABASE_ID,
          TRANCHES_MILESTONES_ID,
          $id,
          dataToUpdate
        );
        setMilestones((prev) =>
          prev.map((m) => (m.$id === $id ? currentMilestone : m))
        );
      } else {
        const response = await databases.createDocument(
          STAGING_DATABASE_ID,
          TRANCHES_MILESTONES_ID,
          "unique()",
          { ...currentMilestone, startupId }
        );

        // Ensure the response is correctly typed as TrancheMilestone
        const newMilestone: TrancheMilestone = {
          $id: response.$id,
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
          startupId: response.startupId,
          trancheType: response.trancheType,
          status: response.status,
          amount: response.amount,
          milestones: response.milestones,
          date: response.date,
          noteMilestones: response.noteMilestones,
        };

        setMilestones((prev) => [...prev, newMilestone]);
      }
      setIsDialogOpen(false);
      setCurrentMilestone(defaultMilestone);
      setIsEditing(false);
    } catch (error) {
      console.error(
        isEditing ? "Error updating milestone:" : "Error adding milestone:",
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (milestone: TrancheMilestone) => {
    setCurrentMilestone({ ...milestone });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteMilestone = async () => {
    if (currentMilestone.$id) {
      try {
        await databases.deleteDocument(
          STAGING_DATABASE_ID,
          TRANCHES_MILESTONES_ID,
          currentMilestone.$id
        );
        setMilestones((prev) =>
          prev.filter((m) => m.$id !== currentMilestone.$id)
        );
        setIsDialogOpen(false);
        setCurrentMilestone(defaultMilestone);
        setIsEditing(false);
      } catch (error) {
        console.error("Error deleting milestone:", error);
      }
    }
  };

  const handleAddClick = () => {
    setCurrentMilestone(defaultMilestone);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const totalAmount = milestones.reduce((sum, milestone) => {
    const amount = parseFloat(milestone.amount.replace(/₹|,/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">
          Tranches & Milestones
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <ButtonWithIcon label="Add" onClick={handleAddClick} />
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit" : "Add New"} Tranche & Milestone
              </DialogTitle>
              <DialogDescription aria-describedby={undefined}>
                {isEditing
                  ? "Modify the details of the selected tranche and milestone."
                  : "Enter the details for a new tranche and milestone."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="trancheType">Tranche Type</Label>
                <Select
                  name="trancheType"
                  value={currentMilestone.trancheType}
                  onValueChange={(value) =>
                    handleSelectChange("trancheType", value)
                  }
                >
                  <SelectTrigger id="trancheType-trigger">
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
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="text"
                  name="amount"
                  placeholder="Enter amount in INR"
                  value={currentMilestone.amount}
                  onChange={handleAmountChange}
                />
                {amountError && (
                  <p className="text-red-500 text-sm mt-1">{amountError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={currentMilestone.status}
                  onValueChange={(value) =>
                    handleSelectChange("status", value)
                  }
                >
                  <SelectTrigger>
                    {/* Optional ID for the trigger */}
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Released">Released</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  type="month"
                  name="date"
                  value={currentMilestone.date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="milestones">Milestones</Label>
                <Textarea
                  name="milestones"
                  placeholder="Milestones"
                  value={currentMilestone.milestones}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="noteMilestones">Note on Milestones</Label>
                <Textarea
                  name="noteMilestones"
                  placeholder="Enter note ..."
                  value={currentMilestone.noteMilestones}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {isEditing && (
                <Button
                  onClick={handleDeleteMilestone}
                  className="bg-white text-black border border-black hover:bg-neutral-200"
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              )}
              <Button onClick={handleSaveMilestone} disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Saving..."
                  : isEditing
                  ? "Update"
                  : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of recent Tranches & Milestones.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Tranches</TableHead>
              <TableHead>Amount (As Per SHA)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Milestones</TableHead>
              <TableHead>Note on Milestones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone) => (
              <TableRow
                key={milestone.$id}
                onDoubleClick={() => handleEditClick(milestone)}
              >
                <TableCell>{milestone.trancheType}</TableCell>
                <TableCell>{milestone.amount}</TableCell>
                <TableCell>{milestone.status}</TableCell>
                <TableCell>{milestone.date}</TableCell>
                <TableCell>{milestone.milestones}</TableCell>
                <TableCell>{milestone.noteMilestones}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell colSpan={1} className="text-right">
                Total:
              </TableCell>
              <TableCell>₹{totalAmount.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TranchesMilestones;
