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

interface Contribution {
  month: string;
  employerContribution: string;
  ipContribution: string;
  totalContribution: string;
}

interface ESICDetailsProps {
  startupId: string;
  setIsDirty: (isDirty: boolean) => void;
}

const ESICDetails: React.FC<ESICDetailsProps> = ({ startupId, setIsDirty }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);

  return (
    <div>
      <h3 className="text-lg font-medium">ESIC Details</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month (FY 23)</TableHead>
            <TableHead>Employer Contribution (₹)</TableHead>
            <TableHead>IP Contribution (₹)</TableHead>
            <TableHead>Total Contribution (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                No contributions added yet.
              </TableCell>
            </TableRow>
          ) : (
            contributions.map((contribution, index) => (
              <TableRow key={index}>
                <TableCell>{contribution.month}</TableCell>
                <TableCell>{contribution.employerContribution}</TableCell>
                <TableCell>{contribution.ipContribution}</TableCell>
                <TableCell>{contribution.totalContribution}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ESICDetails;
