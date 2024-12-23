"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { Client, Databases, Models } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
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
  return funds.reduce((total, fund) => total + parseFloat(fund.amount || '0'), 0);
};

const FundAsk: React.FC<FundAskProps> = ({ startupId }) => {
  const [proposedFunds, setProposedFunds] = useState<FundItem[]>([]);
  const [validatedFunds, setValidatedFunds] = useState<FundItem[]>([]);
  const [editingItems, setEditingItems] = useState<{ [key: string]: boolean }>({});
  const [newProposedFund, setNewProposedFund] = useState<Omit<FundItem, "startupId" | "$id">>({
    description: "",
    amount: "",
  });
  const [newValidatedFund, setNewValidatedFund] = useState<Omit<FundItem, "startupId" | "$id">>({
    description: "",
    amount: "",
  });

  const client = useMemo(() => new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID), []);
  const databases = useMemo(() => new Databases(client), [client]);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const [proposedResponse, validatedResponse] = await Promise.all([
          databases.listDocuments(DATABASE_ID, PROPOSED_FUND_ASK_ID, [
            Query.equal("startupId", startupId),
          ]),
          databases.listDocuments(DATABASE_ID, VALIDATED_FUND_ASK_ID, [
            Query.equal("startupId", startupId),
          ]),
        ]);
        setProposedFunds(proposedResponse.documents.map(mapDocumentToFundItem));
        setValidatedFunds(validatedResponse.documents.map(mapDocumentToFundItem));
      } catch (error) {
        console.error("Error fetching funds:", error);
      }
    };
    fetchFunds();
  }, [startupId, databases]);

  const handleAddItem = async (type: "proposed" | "validated") => {
    try {
      const newItem = type === "proposed" ? newProposedFund : newValidatedFund;
      const collectionId = type === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
      const response = await databases.createDocument(
        DATABASE_ID,
        collectionId,
        "unique()",
        { ...newItem, startupId }
      );
      const newFundItem = mapDocumentToFundItem(response);
      if (type === "proposed") {
        setProposedFunds([...proposedFunds, newFundItem]);
        setNewProposedFund({ description: "", amount: "" });
      } else {
        setValidatedFunds([...validatedFunds, newFundItem]);
        setNewValidatedFund({ description: "", amount: "" });
      }
    } catch (error) {
      console.error("Error adding fund:", error);
    }
  };

  const handleEditChange = (
    index: number,
    field: keyof FundItem,
    value: string,
    type: "proposed" | "validated"
  ) => {
    const funds = type === "proposed" ? [...proposedFunds] : [...validatedFunds];
    funds[index] = { ...funds[index], [field]: value };
    if (type === "proposed") {
      setProposedFunds(funds);
    } else {
      setValidatedFunds(funds);
    }
    setEditingItems({ ...editingItems, [funds[index].$id!]: true });
  };

  const handleSaveItem = async (
    index: number,
    type: "proposed" | "validated"
  ) => {
    const funds = type === "proposed" ? proposedFunds : validatedFunds;
    const collectionId = type === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
    const item = funds[index];
    try {
      if (item.$id) {
        const { $id, ...data } = item;
        await databases.updateDocument(DATABASE_ID, collectionId, $id, data);
        setEditingItems({ ...editingItems, [$id]: false });
      }
    } catch (error) {
      console.error("Error saving fund:", error);
    }
  };

  const handleDeleteItem = async (id: string, type: "proposed" | "validated") => {
    try {
      const collectionId = type === "proposed" ? PROPOSED_FUND_ASK_ID : VALIDATED_FUND_ASK_ID;
      await databases.deleteDocument(DATABASE_ID, collectionId, id);
      if (type === "proposed") {
        setProposedFunds(proposedFunds.filter(item => item.$id !== id));
      } else {
        setValidatedFunds(validatedFunds.filter(item => item.$id !== id));
      }
    } catch (error) {
      console.error("Error deleting fund:", error);
    }
  };

  return (
    <div className="container mx-auto space-y-4">
      <FundTable
        title="Proposed Fund Ask"
        funds={proposedFunds}
        newFund={newProposedFund}
        onAdd={() => handleAddItem("proposed")}
        onEditChange={(index, field, value) => handleEditChange(index, field, value, "proposed")}
        onSave={(index) => handleSaveItem(index, "proposed")}
        onDelete={(id) => handleDeleteItem(id, "proposed")}
        setNewFund={setNewProposedFund}
        editingItems={editingItems}
      />
      <FundTable
        title="Validated Fund Ask"
        funds={validatedFunds}
        newFund={newValidatedFund}
        onAdd={() => handleAddItem("validated")}
        onEditChange={(index, field, value) => handleEditChange(index, field, value, "validated")}
        onSave={(index) => handleSaveItem(index, "validated")}
        onDelete={(id) => handleDeleteItem(id, "validated")}
        setNewFund={setNewValidatedFund}
        editingItems={editingItems}
      />
    </div>
  );
};

interface FundTableProps {
  title: string;
  funds: FundItem[];
  newFund: Omit<FundItem, "startupId" | "$id">;
  onAdd: () => void;
  onEditChange: (index: number, field: keyof FundItem, value: string) => void;
  onSave: (index: number) => void;
  onDelete: (id: string) => void;
  setNewFund: React.Dispatch<React.SetStateAction<Omit<FundItem, "startupId" | "$id">>>;
  editingItems: { [key: string]: boolean };
}

const FundTable: React.FC<FundTableProps> = ({
  title,
  funds,
  newFund,
  onAdd,
  onEditChange,
  onSave,
  onDelete,
  setNewFund,
  editingItems,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ [key: string]: boolean }>({});
  const total = calculateTotal(funds);

  const handleDoubleClick = (id: string) => {
    setDeleteConfirmation({ ...deleteConfirmation, [id]: true });
  };

  const handleDiscard = (id: string) => {
    setDeleteConfirmation({ ...deleteConfirmation, [id]: false });
  };

  return (
    <div>
    <h3 className="container text-lg font-medium mb-2 -mt-4">
        Fund Ask
    </h3>
    <div className="p-4 bg-white border border-gray-300 rounded shadow">
      <h4 className="mb-4 text-lg font-semibold">{title}</h4>
      <Table>
        <TableCaption>{`A list of ${title.toLowerCase()}.`}</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Utilization Description</TableHead>
            <TableHead>Budgeted Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.map((item, index) => (
            <TableRow key={item.$id || index} onDoubleClick={() => handleDoubleClick(item.$id!)}>
              <TableCell>
                <Textarea
                  value={item.description}
                  onChange={(e) => onEditChange(index, "description", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={item.amount}
                  onChange={(e) => onEditChange(index, "amount", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {deleteConfirmation[item.$id!] ? (
                  <div className="space-x-2">
                    <span>Delete row?</span>
                    <button onClick={() => onDelete(item.$id!)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Yes
                    </button>
                    <button onClick={() => handleDiscard(item.$id!)} className="bg-gray-300 text-black px-2 py-1 rounded">
                      No
                    </button>
                  </div>
                ) : editingItems[item.$id!] ? (
                  <button onClick={() => onSave(index)} className="text-green-500">
                    <SaveIcon size={20} />
                  </button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <input
                disabled
                value={newFund.description}
                onChange={(e) => setNewFund({ ...newFund, description: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Add Description"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newFund.amount}
                onChange={(e) => setNewFund({ ...newFund, amount: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Add Amount"
              />
            </TableCell>
            <TableCell>
              <button onClick={onAdd} className="text-blue-500">
                <PlusCircle size={20} />
              </button>
            </TableCell>
          </TableRow>
          <TableRow className="font-bold">
            <TableCell>Total</TableCell>
            <TableCell>₹ {total.toFixed(2)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    </div>
  );
};

export default FundAsk;
