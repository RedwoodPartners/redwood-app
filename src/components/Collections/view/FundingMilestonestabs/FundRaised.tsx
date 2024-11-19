"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, SaveIcon } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

export const FUND_RAISED_ID = "6731e2fb000d9580025f";

interface FundRaisedSoFarProps {
  startupId: string;
}

const FundRaisedSoFar: React.FC<FundRaisedSoFarProps> = ({ startupId }) => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newInvestment, setNewInvestment] = useState({
    stage: "",
    round: "",
    mode: "",
    date: "",
    amount: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
  
    const fetchInvestments = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, FUND_RAISED_ID, [
          Query.equal("startupId", startupId),
        ]);
        setInvestments(response.documents);
      } catch (error) {
        console.error("Error fetching investments:", error);
      }
    };
  
    fetchInvestments();
  }, [startupId]);
  

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedInvestments = [...investments];
    updatedInvestments[index][field] = value;
    setInvestments(updatedInvestments);
    setEditingIndex(index); // row in edit mode
  };

  const handleSaveInvestment = async (index: number) => {
    const investment = investments[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = investment;
    try {
      await databases.updateDocument(DATABASE_ID, FUND_RAISED_ID, $id, dataToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null); // Remove edit mode after saving
    } catch (error) {
      console.error("Error saving investment:", error);
    }
  };

  const handleAddInvestment = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        FUND_RAISED_ID,
        "unique()",
        { ...newInvestment, startupId }
      );
      setInvestments([...investments, response]);
      setNewInvestment({
        stage: "",
        round: "",
        mode: "",
        date: "",
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding investment:", error);
    }
  };

  const totalAmount = investments.reduce((sum, investment) => {
    const amount = parseFloat(investment.amount.replace(/₹|,/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div>
      <h3 className="container text-lg font-bold mb-2 -mt-4 p-2">
        Fund Raised So Far
      </h3>
      <Table>
        <TableCaption>A list of recent investments.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Investment Stage</TableHead>
            <TableHead>Round Name</TableHead>
            <TableHead>Mode of Investment</TableHead>
            <TableHead>Investment Date</TableHead>
            <TableHead>Investment Amount (INR)</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment, index) => (
            <TableRow key={investment.$id}>
              <TableCell>
                <input
                  type="text"
                  value={investment.stage}
                  onChange={(e) => handleEditChange(index, "stage", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={investment.round}
                  onChange={(e) => handleEditChange(index, "round", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={investment.mode}
                  onChange={(e) => handleEditChange(index, "mode", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="date"
                  value={investment.date}
                  onChange={(e) => handleEditChange(index, "date", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
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
                <input
                  type="text"
                  value={investment.description}
                  onChange={(e) => handleEditChange(index, "description", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {editingIndex === index && (
                  <button onClick={() => handleSaveInvestment(index)} className="text-black rounded-full transition">
                    <SaveIcon size={20} />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <input
                type="text"
                value={newInvestment.stage}
                onChange={(e) => setNewInvestment({ ...newInvestment, stage: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Stage"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newInvestment.round}
                onChange={(e) => setNewInvestment({ ...newInvestment, round: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Round"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newInvestment.mode}
                onChange={(e) => setNewInvestment({ ...newInvestment, mode: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Mode"
              />
            </TableCell>
            <TableCell>
              <input
                type="date"
                value={newInvestment.date}
                onChange={(e) => setNewInvestment({ ...newInvestment, date: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newInvestment.amount}
                onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Amount"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newInvestment.description}
                onChange={(e) => setNewInvestment({ ...newInvestment, description: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Description"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddInvestment} className="text-black rounded-full transition">
                <PlusCircle size={20} />
              </button>
            </TableCell>
          </TableRow>
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={4} className="text-right">Total:</TableCell>
            <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default FundRaisedSoFar;
