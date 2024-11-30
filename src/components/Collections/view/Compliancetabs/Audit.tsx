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
    action: "",
    date: "",
    prvStatus: "",
    curStatus: "",
    founderName: "",
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
      setNewCompliance({ action: "", date: "", prvStatus: "", curStatus: "", founderName: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Audit</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>Audits Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Action</TableHead>
            <TableHead>Date of Action</TableHead>
            <TableHead>Previous Status</TableHead>
            <TableHead>Current Status</TableHead>
            <TableHead>Application Founder Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complianceData.map((row, index) => (
            <TableRow key={row.$id}>
              <TableCell>
                <input
                  type="text"
                  value={row.action}
                  onChange={(e) => handleEditChange(index, "action", e.target.value)}
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
                <input
                  type="text"
                  value={row.prvStatus}
                  onChange={(e) => handleEditChange(index, "prvStatus", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.curStatus}
                  onChange={(e) => handleEditChange(index, "curStatus", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.founderName}
                  onChange={(e) => handleEditChange(index, "founderName", e.target.value)}
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
                value={newCompliance.action}
                onChange={(e) => setNewCompliance({ ...newCompliance, action: e.target.value })}
                placeholder="Action"
                className="w-full h-5 border-none focus:outline-none"
              />
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
                value={newCompliance.prvStatus}
                onChange={(e) => setNewCompliance({ ...newCompliance, prvStatus: e.target.value })}
                placeholder="Previous Status"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newCompliance.curStatus}
                onChange={(e) => setNewCompliance({ ...newCompliance, curStatus: e.target.value })}
                placeholder="Current Status"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                value={newCompliance.founderName}
                onChange={(e) => setNewCompliance({ ...newCompliance, founderName: e.target.value })}
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
