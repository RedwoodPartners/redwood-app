"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, Save, Edit } from "lucide-react";
import { Client, Databases, Models } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const PROPOSED_FUND_ASK_ID = "67358bc4000af32965f2";
export const VALIDATED_FUND_ASK_ID = "67694e77002cc9cd69c4";

interface FundAskProps {
  startupId: string;
}

interface FundItem {
  $id?: string;
  description: string;
  amount: string;
  startupId: string;
}

const mapDocumentToFundItem = (doc: Models.Document): FundItem => ({
  $id: doc.$id,
  description: doc.description,
  amount: doc.amount,
  startupId: doc.startupId,
});

const calculateTotal = (funds: FundItem[]): number => {
  return funds.reduce((total, fund) => {
    const cleanAmount = fund.amount.replace(/[^0-9.]/g, '');
    return total + (parseFloat(cleanAmount) || 0);
  }, 0);
};

const formatINR = (value: string): string => {
  const number = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const FundAsk: React.FC<FundAskProps> = ({ startupId }) => {
  const [proposedFunds, setProposedFunds] = useState<FundItem[]>([]);
  const [validatedFunds, setValidatedFunds] = useState<FundItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<"proposed" | "validated">("proposed");
  const [editingFund, setEditingFund] = useState<FundItem | null>(null);
  const [proposedFundAsk, setProposedFundAsk] = useState("");
  const [validatedFundAsk, setValidatedFundAsk] = useState("");
  const [isEditingProposed, setIsEditingProposed] = useState(false);
  const [isEditingValidated, setIsEditingValidated] = useState(false);

  const client = useMemo(() => new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID), []);
  const databases = useMemo(() => new Databases(client), [client]);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const [proposedResponse, validatedResponse] = await Promise.all([
          databases.listDocuments(DATABASE_ID, PROPOSED_FUND_ASK_ID, [Query.equal("startupId", startupId)]),
          databases.listDocuments(DATABASE_ID, VALIDATED_FUND_ASK_ID, [Query.equal("startupId", startupId)]),
        ]);

        setProposedFunds(proposedResponse.documents.map(mapDocumentToFundItem));
        setValidatedFunds(validatedResponse.documents.map(mapDocumentToFundItem));

        try {
          const proposedFundAskDoc = await databases.getDocument(DATABASE_ID, PROPOSED_FUND_ASK_ID, startupId);
          setProposedFundAsk(proposedFundAskDoc.proposedFund || "");
        } catch (error) {
          console.log("Proposed Fund Ask document not found");
          setProposedFundAsk("");
        }

        try {
          const validatedFundAskDoc = await databases.getDocument(DATABASE_ID, VALIDATED_FUND_ASK_ID, startupId);
          setValidatedFundAsk(validatedFundAskDoc.validatedFund || "");
        } catch (error) {
          console.log("Validated Fund Ask document not found");
          setValidatedFundAsk("");
        }
      } catch (error) {
        console.error("Error fetching funds:", error);
        setProposedFunds([]);
        setValidatedFunds([]);
        setProposedFundAsk("");
        setValidatedFundAsk("");
      }
    };

    fetchFunds();
  }, [startupId, databases]);

  const handleAddItem = async () => {
    try {
      const collectionId = activeTable === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
      const response = await databases.createDocument(DATABASE_ID, collectionId, "unique()", { ...editingFund, startupId });
      const newFundItem = mapDocumentToFundItem(response);
      if (activeTable === "proposed") {
        setProposedFunds([...proposedFunds, newFundItem]);
      } else {
        setValidatedFunds([...validatedFunds, newFundItem]);
      }
      setEditingFund(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding fund:", error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingFund || !editingFund.$id) return;
    try {
      const collectionId = activeTable === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
      const { $id, ...updateData } = editingFund;
      await databases.updateDocument(DATABASE_ID, collectionId, $id, updateData);
      const updatedFunds = activeTable === "proposed" ? proposedFunds : validatedFunds;
      const updatedFundsList = updatedFunds.map(fund => fund.$id === $id ? editingFund : fund);
      if (activeTable === "proposed") {
        setProposedFunds(updatedFundsList);
      } else {
        setValidatedFunds(updatedFundsList);
      }
      setEditingFund(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating fund:", error);
    }
  };

  const handleDeleteItem = async () => {
    if (!editingFund || !editingFund.$id) return;
    try {
      const collectionId = activeTable === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
      await databases.deleteDocument(DATABASE_ID, collectionId, editingFund.$id);
      const updatedFunds = activeTable === "proposed" ? proposedFunds : validatedFunds;
      const updatedFundsList = updatedFunds.filter(fund => fund.$id !== editingFund.$id);
      if (activeTable === "proposed") {
        setProposedFunds(updatedFundsList);
      } else {
        setValidatedFunds(updatedFundsList);
      }
      setEditingFund(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting fund:", error);
    }
  };

  const handleRowDoubleTap = (fund: FundItem, type: "proposed" | "validated") => {
    setActiveTable(type);
    setEditingFund(fund);
    setIsDialogOpen(true);
  };

  const handleSave = async (type: "proposed" | "validated") => {
    try {
      const collectionId = type === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
      const fundAsk = type === "proposed" ? proposedFundAsk : validatedFundAsk;
      const data = type === "proposed" ? { proposedFund: fundAsk } : { validatedFund: fundAsk };

      try {
        await databases.updateDocument(DATABASE_ID, collectionId, startupId, data);
      } catch (error) {
        await databases.createDocument(DATABASE_ID, collectionId, startupId, data);
      }

      if (type === "proposed") {
        setIsEditingProposed(false);
      } else {
        setIsEditingValidated(false);
      }
    } catch (error) {
      console.error(`Error saving ${type} fund ask:`, error);
    }
  };

  return (
    <>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Fund Ask</h3>
      <div className="container mx-auto space-y-4">
        <FundTable
          title="Proposed Fund Ask"
          funds={proposedFunds}
          onRowDoubleTap={(fund) => handleRowDoubleTap(fund, "proposed")}
          onOpenDialog={() => {
            setActiveTable("proposed");
            setEditingFund({ description: "", amount: "", startupId });
            setIsDialogOpen(true);
          }}
          fundAsk={proposedFundAsk}
          setFundAsk={setProposedFundAsk}
          isEditing={isEditingProposed}
          setIsEditing={setIsEditingProposed}
          onSave={() => handleSave("proposed")}
        />
        <FundTable
          title="Validated Fund Ask"
          funds={validatedFunds}
          onRowDoubleTap={(fund) => handleRowDoubleTap(fund, "validated")}
          onOpenDialog={() => {
            setActiveTable("validated");
            setEditingFund({ description: "", amount: "", startupId });
            setIsDialogOpen(true);
          }}
          fundAsk={validatedFundAsk}
          setFundAsk={setValidatedFundAsk}
          isEditing={isEditingValidated}
          setIsEditing={setIsEditingValidated}
          onSave={() => handleSave("validated")}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFund?.$id ? "Edit Fund Item" : "Add New Fund Item"}</DialogTitle>
            <DialogDescription aria-describedby={undefined}>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="description">Utilization Description</Label>
              <Textarea
                id="description"
                value={editingFund?.description || ""}
                onChange={(e) => setEditingFund({ ...editingFund!, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="text"
                id="amount"
                placeholder="Enter amount in INR"
                value={editingFund?.amount || ""}
                onChange={(e) => {
                  const formattedValue = formatINR(e.target.value);
                  setEditingFund({ ...editingFund!, amount: formattedValue });
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {editingFund?.$id && (
              <Button onClick={handleDeleteItem} className="bg-white text-black border border-black hover:bg-neutral-200">Delete</Button>
            )}
            <Button type="submit" onClick={editingFund?.$id ? handleUpdateItem : handleAddItem}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FundTableProps {
  title: string;
  funds: FundItem[];
  onRowDoubleTap: (fund: FundItem) => void;
  onOpenDialog: () => void;
  fundAsk: string;
  setFundAsk: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onSave: () => void;
}

const FundTable: React.FC<FundTableProps> = ({
  title,
  funds,
  onRowDoubleTap,
  onOpenDialog,
  fundAsk,
  setFundAsk,
  isEditing,
  setIsEditing,
  onSave,
}) => {
  const total = calculateTotal(funds);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-2 bg-white shadow-md rounded-lg border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">{title}</h4>
        <div onClick={onOpenDialog}>
          <PlusCircle size={20} className="mr-2 cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center mb-4">
        <span className="mr-2 text-xs">{title}:</span>
        <div className="flex items-center">
          <Input
            type="text"
            className="w-52"
            value={fundAsk}
            onChange={(e) => setFundAsk(formatINR(e.target.value))}
            disabled={!isEditing}
          />
          {isEditing ? (
            <Save size={20} className="ml-2 cursor-pointer" onClick={onSave} />
          ) : (
            <Edit size={20} className="ml-2 cursor-pointer" onClick={() => setIsEditing(true)} />
          )}
        </div>
      </div>
      <Table>
        <TableCaption>{`A list of ${title.toLowerCase()}.`}</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-1/2">Utilization Description</TableHead>
            <TableHead>Budgeted Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.map((item) => (
            <TableRow key={item.$id} onDoubleClick={() => onRowDoubleTap(item)}>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.amount}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell>Total</TableCell>
            <TableCell>{formatCurrency(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default FundAsk;
