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
import { Textarea } from "@/components/ui/textarea";

const INCUBATION_ID = "673c2945001eddd9aea3";

interface IncubationProps {
  startupId: string;
}

const Incubation: React.FC<IncubationProps> = ({ startupId }) => {
  const [incubationData, setIncubationData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newIncubation, setNewIncubation] = useState({
    program: "",
    date: "",
    status: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchComplianceData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, INCUBATION_ID, [
          Query.equal("startupId", startupId),
        ]);
        setIncubationData(response.documents);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };

    fetchComplianceData();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedData = [...incubationData];
    updatedData[index][field] = value;
    setIncubationData(updatedData);
    setEditingIndex(index);
  };

  const handleSaveCompliance = async (index: number) => {
    const dataToUpdate = incubationData[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...fieldsToUpdate } = dataToUpdate;

    try {
      await databases.updateDocument(DATABASE_ID, INCUBATION_ID, $id, fieldsToUpdate);
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
        INCUBATION_ID,
        "unique()",
        { ...newIncubation, startupId }
      );
      setIncubationData([...incubationData, response]);
      setNewIncubation({ program: "", date: "", status: "", description: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Incubation</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>Incubation Program Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Incubation Program</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incubationData.map((row, index) => (
            <TableRow key={row.$id}>
              <TableCell>
                <input
                  type="text"
                  value={row.program}
                  onChange={(e) => handleEditChange(index, "program", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
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
                <select
                  value={row.status}
                  onChange={(e) => handleEditChange(index, "status", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="Applied">Applied</option>
                  <option value="Incubated">Incubated</option>
                  <option value="Exited">Exited</option>
                </select>
              </TableCell>
              <TableCell>
                <Textarea
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
                disabled
                value={newIncubation.program}
                onChange={(e) => setNewIncubation({ ...newIncubation, program: e.target.value })}
                placeholder="Incubation Program"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
          
            <TableCell>
              <input
                type="date"
                disabled
                value={newIncubation.date}
                onChange={(e) => setNewIncubation({ ...newIncubation, date: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
              disabled
                value={newIncubation.status}
                onChange={(e) => setNewIncubation({ ...newIncubation, status: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="select"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newIncubation.description}
                onChange={(e) => setNewIncubation({ ...newIncubation, description: e.target.value })}
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

export default Incubation;
