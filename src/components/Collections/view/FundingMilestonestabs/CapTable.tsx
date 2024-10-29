"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const CapTable: React.FC = () => {
  const [capTableData, setCapTableData] = useState([
    {
      roundName: "TANSIM",
      shareholderName: "Ravi Senji",
      role: "Founder",
      capitalStructure: "33%",
    },
    {
      roundName: "TANSIM",
      shareholderName: "Pandian",
      role: "Founder",
      capitalStructure: "61%",
    },
    {
      roundName: "TANSIM",
      shareholderName: "Techin Palakkad",
      role: "Institutional Investor",
      capitalStructure: "6%",
    },
  ]);

  const addRow = () => {
    const newRow = {
      roundName: "New Round",
      shareholderName: "New Shareholder",
      role: "New Role",
      capitalStructure: "0%",
    };
    setCapTableData([...capTableData, newRow]);
  };

  // Calculate the total of Capital Structure percentages
  const calculateTotalCapital = () => {
    return capTableData.reduce((total, row) => {
      const value = parseFloat(row.capitalStructure.replace("%", "")) || 0;
      return total + value;
    }, 0);
  };

  return (
    <div>
      <h3 className="container text-xl font-bold mb-4 -mt-6">
        Cap Table
        <button
          onClick={addRow}
          className="ml-2 text-black rounded-full transition"
          title="Add Row"
        >
          <PlusCircle size={24} />
        </button>
      </h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Round Name</TableHead>
            <TableHead>Shareholder Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Capital Structure</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capTableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.roundName}</TableCell>
              <TableCell>{row.shareholderName}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.capitalStructure}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={3} className="text-right">
              Total
            </TableCell>
            <TableCell>{calculateTotalCapital()}%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default CapTable;
