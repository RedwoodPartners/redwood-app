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

const AUDITS_ID = "673b1dc40027a277990a";

interface AuditsProps {
  startupId: string;
}

const Audits: React.FC<AuditsProps> = ({ startupId }) => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCompliance, setNewCompliance] = useState({
    query: "",
    yesNo: "",
    date: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, AUDITS_ID, [
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
      await databases.updateDocument(DATABASE_ID, AUDITS_ID, $id, fieldsToUpdate);
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
        AUDITS_ID,
        "unique()",
        { ...newCompliance, startupId }
      );
      setComplianceData([...complianceData, response]);
      setNewCompliance({ query: "", yesNo: "", date: "", description: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-xl font-bold mb-4 -mt-6">Audits</h3>
      <Table>
        <TableCaption>Audits Information</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Form Queries</TableHead>
            <TableHead>Yes/No</TableHead>
            <TableHead>Choose Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complianceData.map((row, index) => (
            <TableRow key={row.$id}>
              <TableCell>
                <input
                  type="text"
                  value={row.query}
                  onChange={(e) => handleEditChange(index, "query", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Label className=" space-x-1">
                    <input
                      type="radio"
                      name={`yesNo-${index}`}
                      value="yes"
                      checked={row.yesNo === "yes"}
                      onChange={(e) => handleEditChange(index, "yesNo", e.target.value)}
                    />
                    <span>Yes</span>
                  </Label>
                  <Label className="space-x-1">
                    <input
                      type="radio"
                      name={`yesNo-${index}`}
                      value="no"
                      checked={row.yesNo === "no"}
                      onChange={(e) => handleEditChange(index, "yesNo", e.target.value)}
                    />
                    <span>No</span>
                  </Label>
                </div>
              </TableCell>
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
                  value={row.description}
                  onChange={(e) => handleEditChange(index, "description", e.target.value)}
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
                type="text"
                value={newCompliance.query}
                onChange={(e) => setNewCompliance({ ...newCompliance, query: e.target.value })}
                placeholder="Form Query"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <div className="flex space-x-4">
                <Label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="new-yesNo"
                    value="yes"
                    checked={newCompliance.yesNo === "yes"}
                    onChange={(e) => setNewCompliance({ ...newCompliance, yesNo: e.target.value })}
                  />
                  <span>Yes</span>
                </Label>
                <Label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="new-yesNo"
                    value="no"
                    checked={newCompliance.yesNo === "no"}
                    onChange={(e) => setNewCompliance({ ...newCompliance, yesNo: e.target.value })}
                  />
                  <span>No</span>
                </Label>
              </div>
            </TableCell>
            <TableCell>
              <input
                type="date"
                value={newCompliance.date}
                onChange={(e) => setNewCompliance({ ...newCompliance, date: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newCompliance.description}
                onChange={(e) => setNewCompliance({ ...newCompliance, description: e.target.value })}
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

export default Audits;
