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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, SaveIcon } from "lucide-react";
import { Query } from "appwrite";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

const GSTR_ID = "673b1988001c3d93380e";

interface GstrComplianceProps {
  startupId: string;
}

const GstrCompliance: React.FC<GstrComplianceProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCompliance, setNewCompliance] = useState({
    date: "",
    gstr1: "",
    gst3b: "",
    difference: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, GSTR_ID, [
          Query.equal("startupId", startupId),
        ]);
        setComplianceData(response.documents);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };

    fetchComplianceData();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedData = [...complianceData];
    updatedData[index][field] = value;
    setComplianceData(updatedData);
    setEditingIndex(index);
  };

  const handleSaveCompliance = async (index: number) => {
    const dataToUpdate = complianceData[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...fieldsToUpdate } = dataToUpdate;

    try {
      await databases.updateDocument(DATABASE_ID, GSTR_ID, $id, fieldsToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving compliance data:", error);
    }
  };

  const handleAddComplianceData = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        GSTR_ID,
        "unique()",
        { ...newCompliance, startupId }
      );
      setComplianceData([...complianceData, response]);
      setNewCompliance({ date: "", gstr1: "", gst3b: "", difference: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">GSTR-1 & GSTR-3B</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>GSTR Compliance Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Month</TableHead>
            <TableHead>GST R1</TableHead>
            <TableHead>GST 3B</TableHead>
            <TableHead>Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complianceData.map((row, index) => (
            <TableRow key={row.$id}>
              
              <TableCell>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleEditChange(index, "date", e.target.value)}
                  className=" h-5 border-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.gstr1}
                  onChange={(e) => handleEditChange(index, "gstr1", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.gst3b}
                  onChange={(e) => handleEditChange(index, "gst3b", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.difference}
                  onChange={(e) => handleEditChange(index, "difference", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {editingIndex === index && (
                  <button onClick={() => handleSaveCompliance(index)} className="text-black rounded-full transition">
                    <SaveIcon size={20} />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <input
                type="date"
                disabled
                value={newCompliance.date}
                onChange={(e) => setNewCompliance({ ...newCompliance, date: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newCompliance.gstr1}
                onChange={(e) => setNewCompliance({ ...newCompliance, gstr1: e.target.value })}
                placeholder="GST R1"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newCompliance.gst3b}
                onChange={(e) => setNewCompliance({ ...newCompliance, gst3b: e.target.value })}
                placeholder="GST 3B"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newCompliance.difference}
                onChange={(e) => setNewCompliance({ ...newCompliance, difference: e.target.value })}
                placeholder="Description"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddComplianceData} className="text-black rounded-full transition">
                <PlusCircle size={20} />
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default GstrCompliance;
