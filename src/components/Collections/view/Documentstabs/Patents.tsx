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

const PATENTS_ID = "673add4700120ef26d13";

interface PatentsProps {
  startupId: string;
}

const Patents: React.FC<PatentsProps> = ({ startupId }) => {
  const [patentsData, setPatentsData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPatents, setNewPatents] = useState({
    patent: "",
    date: "",
    status: "",
    description: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchPatentsData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PATENTS_ID, [
          Query.equal("startupId", startupId),
        ]);
        setPatentsData(response.documents);
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      }
    };

    fetchPatentsData();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedData = [...patentsData];
    updatedData[index][field] = value;
    setPatentsData(updatedData);
    setEditingIndex(index);
  };

  const handleSavePatents = async (index: number) => {
    const dataToUpdate = patentsData[index];
    const fieldsToUpdate = {
      patent: dataToUpdate.patent,
      date: dataToUpdate.date,
      status: dataToUpdate.status,
      description: dataToUpdate.description,
    };
  
    try {
      await databases.updateDocument(DATABASE_ID, PATENTS_ID, dataToUpdate.$id, fieldsToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving patents data:", error);
    }
  };
  

  const handleAddPatentsData = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        PATENTS_ID,
        "unique()",
        { ...newPatents, startupId }
      );
      setPatentsData([...patentsData, response]);
      setNewPatents({ patent: "", date: "", status: "", description: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Patents</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>Patents Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Patent Name</TableHead>
            <TableHead>Filed Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patentsData.map((row, index) => (
            <TableRow key={row.$id}>
              <TableCell>
                <input
                  type="text"
                  value={row.patent}
                  onChange={(e) => handleEditChange(index, "patent", e.target.value)}
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
                <option value="Filed">select</option>
                <option value="Published">Published</option>
                <option value="Granted">Granted</option>
                <option value="Refused">Refused</option>
                </select>
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
                  <button onClick={() => handleSavePatents(index)} className="text-black rounded-full transition">
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
                value={newPatents.patent}
                onChange={(e) => setNewPatents({ ...newPatents, patent: e.target.value })}
                placeholder="Patent Name"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="date"
                disabled
                value={newPatents.date}
                onChange={(e) => setNewPatents({ ...newPatents, date: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newPatents.status}
                onChange={(e) => setNewPatents({ ...newPatents, status: e.target.value })}
                placeholder="Status"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newPatents.description}
                onChange={(e) => setNewPatents({ ...newPatents, description: e.target.value })}
                placeholder="Description"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddPatentsData} className="text-black rounded-full transition">
                <PlusCircle size={20} />
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default Patents;
