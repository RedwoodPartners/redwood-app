"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const TranchesMilestones: React.FC = () => {
  const [tranches, setTranches] = useState([
    {
      type: "Initial",
      status: "Completed",
      amount: 500000,
      milestones: "Product Launch",
    },
  ]);

  const addTranche = () => {
    const newTranche = {
      type: "New Tranche",
      status: "Pending",
      amount: 0,
      milestones: "New milestone",
    };
    setTranches([...tranches, newTranche]);
  };


  const totalAmount = tranches.reduce((sum, tranche) => sum + tranche.amount, 0);

  return (
    <div>
      <h3 className="container text-xl font-bold mb-4 -mt-6">
        Tranches & Milestones
        <button 
          onClick={addTranche} 
          className="ml-2 text-black rounded-full transition">
          <PlusCircle size={20} />
        </button>
      </h3>
      <Table>
        <TableCaption>A list of tranches and milestones.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Tranche Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount (As per SHA)</TableHead>
            <TableHead>Milestones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tranches.map((tranche, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{tranche.type}</TableCell>
              <TableCell>{tranche.status}</TableCell>
              <TableCell className="text-right">₹{tranche.amount.toLocaleString()}</TableCell>
              <TableCell>{tranche.milestones}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={2} className="text-right">Total:</TableCell>
            <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default TranchesMilestones;
