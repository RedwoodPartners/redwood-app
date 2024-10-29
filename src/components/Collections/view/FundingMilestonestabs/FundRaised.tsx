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

const FundRaisedSoFar: React.FC = () => {
  const [investments, setInvestments] = useState([
    {
      stage: "Seed",
      round: "Pre-Series A",
      mode: "Equity",
      date: "2024-10-01",
      amount: "₹1,000,000",
      description: "A strategic investment to support growth.",
    },
  ]);

  const addInvestment = () => {
    const newInvestment = {
      stage: "New Stage",
      round: "New Round",
      mode: "New Mode",
      date: new Date().toISOString().split("T")[0],
      amount: "₹0",
      description: "Description here.",
    };
    setInvestments([...investments, newInvestment]);
  };


  const totalAmount = investments.reduce((sum, investment) => {

    const amount = parseFloat(investment.amount.replace(/₹|,/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div>
      <h3 className="container text-xl font-bold mb-4 -mt-6">
        Fund Raised So Far
        <button 
          onClick={addInvestment} 
          className="ml-2 text-black rounded-full transition">
          <PlusCircle size={20} />
        </button>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{investment.stage}</TableCell>
              <TableCell>{investment.round}</TableCell>
              <TableCell>{investment.mode}</TableCell>
              <TableCell>{investment.date}</TableCell>
              <TableCell className="text-right">{investment.amount}</TableCell>
              <TableCell>{investment.description}</TableCell>
            </TableRow>
          ))}
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
