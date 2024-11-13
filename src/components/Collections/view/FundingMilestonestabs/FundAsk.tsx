"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, SaveIcon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

export const FUND_ASK_ID = "6aefbb";

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
    ValidedFundAsk: "",
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
      } catch (error) {
        console.error("Error fetching investments:", error);
      }
    };

    fetchFunds();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedFunds = [...funds];
    updatedFunds[index][field] = value;
    setFunds(updatedFunds);
    setEditingIndex(index); // row in edit mode
  };

  const handleSaveItem = async (index: number) => {
    const item = funds[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = item;
    try {
      await databases.updateDocument(DATABASE_ID, FUND_ASK_ID, $id!, dataToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null); // Remove edit mode after saving
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
        ValidedFundAsk: "",
        description2: "",
        amount2: "",
      });
    } catch (error) {
      console.error("Error adding investment:", error);
    }
  };

 

  return (
    <div>
      <h3 className="container text-xl font-bold mb-4">Fund Ask</h3>

      {/* Proposed Fund Ask Table */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-2">Proposed Fund Ask</h4>
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
                    value={item.description}
                    onChange={(e) => handleEditChange(index, "description1", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    value={item.amount || ""}
                    onChange={(e) => handleEditChange(index, "amount1", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  {editingIndex === index && (
                    <button onClick={() => handleSaveItem(index,)} className="text-black rounded-full transition">
                      <SaveIcon size={20} />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {/* New Proposed Item Row */}
          

            {/* Total Amount Row */}
            
          </TableBody>
        </Table>
      </div>

      {/* Validated Fund Ask Table */}
      <div>
        <h4 className="text-lg font-medium mb-2">Validated Fund Ask</h4>
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
                    value={item.description}
                    onChange={(e) => handleEditChange(index, "description", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    value={item.amount || ""}
                    onChange={(e) => handleEditChange(index, "amount", e.target.value)}
                    className="w-full h-5 border-none focus:outline-none"
                  />
                </TableCell>
                <TableCell>
                  {editingIndex === index && (
                    <button onClick={() => handleSaveItem(index)} className="text-black rounded-full transition">
                      <SaveIcon size={20} />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {/* New Validated Item Row */}
            
             

            {/* Total Amount Row */}
            
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FundAsk;
