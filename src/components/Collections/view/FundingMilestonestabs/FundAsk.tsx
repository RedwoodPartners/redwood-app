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

import { PlusCircle, SaveIcon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
export const FUND_ASK_ID = "67358bc4000af32965f2";

interface FundAskProps {
  startupId: string;
}

const FundAsk: React.FC<FundAskProps> = ({ startupId }) => {
  const [funds, setFunds] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newFund, setNewFund] = useState({
    proposedFundAsk: "",
    description1: "",
    amount1: "",
    validatedFundAsk: "",
    description2: "",
    amount2: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchFunds = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, FUND_ASK_ID, [
          Query.equal("startupId", startupId),
        ]);
        setFunds(response.documents);
        calculateTotal(response.documents); // totals when data is fetched
      } catch (error) {
        console.error("Error fetching investments:", error);
      }
    };

    fetchFunds();
  }, [startupId]);

  const calculateTotal = (funds: any[]) => {
    let proposedTotal = 0;
    let validatedTotal = 0;

    // total for Proposed Fund Ask (amount1)
    funds.forEach(item => {
      if (item.amount1) {
        proposedTotal += parseFloat(item.amount1);
      }
      if (item.amount2) {
        validatedTotal += parseFloat(item.amount2);
      }
    });

    // Updating the totals in the state
    setNewFund(prevFund => ({
      ...prevFund,
      proposedFundAsk: proposedTotal.toFixed(2),
      validatedFundAsk: validatedTotal.toFixed(2),
    }));
  };

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedFunds = [...funds];
    updatedFunds[index][field] = value;
    setFunds(updatedFunds);
    setEditingIndex(index); // row in edit mode
    calculateTotal(updatedFunds); // Recalculate total when changes are made
  };

  const handleSaveItem = async (index: number) => {
    const item = funds[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = item;
    try {
      await databases.updateDocument(DATABASE_ID, FUND_ASK_ID, $id!, dataToUpdate);
      setEditingIndex(null); // Remove edit mode after saving
      calculateTotal(funds); // Recalculate total after save
    } catch (error) {
      console.error("Error saving investment:", error);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        FUND_ASK_ID,
        "unique()",
        { ...newFund, startupId }
      );
      setFunds([...funds, response]);
      setNewFund({
        proposedFundAsk: "",
        description1: "",
        amount1: "",
        validatedFundAsk: "",
        description2: "",
        amount2: "",
      });
      calculateTotal([...funds, response]); // Recalculate total after adding item
    } catch (error) {
      console.error("Error adding investment:", error);
    }
  };

  const handleNewFundChange = (field: string, value: string) => {
    setNewFund((prevFund) => ({
      ...prevFund,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto space-y-4 -mt-6">
      <h3 className="text-xl font-bold mb-4">Fund Ask</h3>

      {/* Proposed Fund Ask Box */}
      <div className="flex flex-row p-4 rounded-lg shadow-md bg-white border">
        <h4 className="text-sm font-medium mb-4 w-80 p-3">Proposed Fund Ask
          <input
            type="text"
            value={newFund.proposedFundAsk}
            onChange={(e) => handleNewFundChange("proposedFundAsk", e.target.value)}
            className="w-44 p-1 border rounded focus:outline-none"
            placeholder="Enter Proposed Fund Ask"
          />
        </h4>
        
        <Table>
          <TableCaption>A list of proposed fund asks.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Utilization Description</TableHead>
              <TableHead>Budgeted Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funds.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <input
                    type="text"
                    value={item.description1}
                    onChange={(e) => handleEditChange(index, "description1", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    value={item.amount1 || ""}
                    onChange={(e) => handleEditChange(index, "amount1", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <button onClick={() => handleSaveItem(index)} className="text-black rounded-full transition">
                      <SaveIcon size={20} />
                    </button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {/* New Proposed Item Row */}
            <TableRow>
              <TableCell>
                <input
                  type="text"
                  value={newFund.description1}
                  onChange={(e) => handleNewFundChange("description1", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                  placeholder="Add Description"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={newFund.amount1}
                  onChange={(e) => handleNewFundChange("amount1", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                  placeholder="Add Amount"
                />
              </TableCell>
              <TableCell>
                <button onClick={handleAddItem} className="text-black rounded-full transition">
                  <PlusCircle size={20} />
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Validated Fund Ask Box */}
      <div className="flex flex-row p-4 rounded-lg shadow-md bg-white border">
        <h4 className="text-sm w-80 font-medium mb-4 p-3">Validated Fund Ask
          <input
            type="text"
            value={newFund.validatedFundAsk}
            onChange={(e) => handleNewFundChange("validatedFundAsk", e.target.value)}
            className="w-44 p-1 border rounded focus:outline-none"
            placeholder="Enter Validated Fund Ask"
          />
        </h4>
      
        <Table>
          <TableCaption>A list of validated fund asks.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Utilization Description</TableHead>
              <TableHead>Budgeted Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funds.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <input
                    type="text"
                    value={item.description2}
                    onChange={(e) => handleEditChange(index, "description2", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    value={item.amount2 || ""}
                    onChange={(e) => handleEditChange(index, "amount2", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <button onClick={() => handleSaveItem(index)} className="text-black rounded-full transition">
                      <SaveIcon size={20} />
                    </button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {/* New Validated Item Row */}
            <TableRow>
              <TableCell>
                <input
                  type="text"
                  value={newFund.description2}
                  onChange={(e) => handleNewFundChange("description2", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                  placeholder="Add Description"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={newFund.amount2}
                  onChange={(e) => handleNewFundChange("amount2", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                  placeholder="Add Amount"
                />
              </TableCell>
              <TableCell>
                <button onClick={handleAddItem} className="text-black rounded-full transition">
                  <PlusCircle size={20} />
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FundAsk;
