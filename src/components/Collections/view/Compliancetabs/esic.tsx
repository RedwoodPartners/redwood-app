"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, Databases, Query } from "appwrite";
import { STAGING_DATABASE_ID, PROJECT_ID } from "@/appwrite/config";
import { client, databases } from "@/lib/utils";

export const ESIC_COLLECTION_ID = "680b1b650005926f5e73"; 

// Fixed interface - removed implicit index signature
interface Contribution {
  $id?: string;  // Now properly optional
  month: string;
  employerContribution: string;
  ipContribution: string;
  totalContribution: string;
}

interface ESICDetailsProps {
  startupId: string;
  setIsDirty: (isDirty: boolean) => void;
}

const months = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

const ESICDetails: React.FC<ESICDetailsProps> = ({ startupId, setIsDirty }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          ESIC_COLLECTION_ID,
          [Query.equal("startupId", startupId)]
        );

        // Properly typed mapping
        const fetchedData = months.map(month => {
          const existing = response.documents.find(doc => doc.month === month);
          return {
            $id: existing?.$id,  // This is now allowed in the interface
            month,
            employerContribution: existing?.employerContribution || "",
            ipContribution: existing?.ipContribution || "",
            totalContribution: existing?.totalContribution || "",
          };
        });

        setContributions(fetchedData);
      } catch (error) {
        console.error("Failed to fetch ESIC details:", error);
      }
    };

    fetchData();
  }, [startupId]);

  // Rest of your component remains unchanged
  const handleInputChange = (index: number, field: keyof Contribution, value: string) => {
    const updated = [...contributions];
    updated[index][field] = value;
    
    if (field !== "totalContribution" && isEditing) {
      const emp = parseFloat(updated[index].employerContribution) || 0;
      const ip = parseFloat(updated[index].ipContribution) || 0;
      updated[index].totalContribution = (emp + ip).toString();
    }
    
    setContributions(updated);
    setIsDirty(true);
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    try {
      const promises = contributions.map(async (contribution) => {
        const data = {
          startupId,
          month: contribution.month,
          employerContribution: contribution.employerContribution,
          ipContribution: contribution.ipContribution,
          totalContribution: contribution.totalContribution,
        };

        if (contribution.$id) {
          return databases.updateDocument(
            STAGING_DATABASE_ID,
            ESIC_COLLECTION_ID,
            contribution.$id,
            data
          );
        } else {
          return databases.createDocument(
            STAGING_DATABASE_ID,
            ESIC_COLLECTION_ID,
            "unique()",
            data
          );
        }
      });

      await Promise.all(promises);
      setIsEditing(false);
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving ESIC details:", error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium">ESIC Details</h3>
      <div className="mb-2 flex gap-2">
        {!isEditing ? (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleEditClick}
          >
            Edit
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSaveClick}
          >
            Save
          </button>
        )}
      </div>
      <div className="border border-gray-300 bg-white rounded-xl p-2">
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
          {contributions.map((contribution, idx) => (
            <TableRow key={contribution.month}>
              <TableCell>{contribution.month}</TableCell>
              <TableCell>
                {isEditing ? (
                  <input
                    type="number"
                    value={contribution.employerContribution}
                    onChange={(e) =>
                      handleInputChange(idx, "employerContribution", e.target.value)
                    }
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  contribution.employerContribution
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <input
                    type="number"
                    value={contribution.ipContribution}
                    onChange={(e) =>
                      handleInputChange(idx, "ipContribution", e.target.value)
                    }
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  contribution.ipContribution
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <input
                    type="number"
                    value={contribution.totalContribution}
                    onChange={(e) =>
                      handleInputChange(idx, "totalContribution", e.target.value)
                    }
                    className="border px-2 py-1 w-full"
                  />
                ) : (
                  contribution.totalContribution
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};

export default ESICDetails;
