"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, SaveIcon, Trash2 } from "lucide-react";
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
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [newPatents, setNewPatents] = useState({
    patent: "",
    inventors: "",
    date: "",
    status: "",
    patentNumber: "",
    approvalDate: "",
    expiryDate: "",
    patentOffice: "",
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
        console.error("Error fetching patents data:", error);
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
      inventors: dataToUpdate.inventors,
      date: dataToUpdate.date,
      status: dataToUpdate.status,
      patentNumber: dataToUpdate.patentNumber,
      approvalDate: dataToUpdate.approvalDate,
      expiryDate: dataToUpdate.expiryDate,
      patentOffice: dataToUpdate.patentOffice,
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
      setNewPatents({ patent: "", inventors: "", date: "", status: "", patentNumber: "", approvalDate: "", expiryDate: "", patentOffice: "", description: "" });
    } catch (error) {
      console.error("Error adding patents data:", error);
    }
  };

  const handleDoubleClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleDeletePatent = async (index: number) => {
    try {
      await databases.deleteDocument(DATABASE_ID, PATENTS_ID, patentsData[index].$id);
      const updatedData = patentsData.filter((_, i) => i !== index);
      setPatentsData(updatedData);
      setDeleteIndex(null);
    } catch (error) {
      console.error("Error deleting patent:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteIndex(null);
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Patents</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>Patents Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Patent Name</TableHead>
            <TableHead>Inventors</TableHead>
            <TableHead>Filed Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Application/Patent Number</TableHead>
            <TableHead>Approval Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Patent Office</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patentsData.map((row, index) => (
            <TableRow key={row.$id} onDoubleClick={() => handleDoubleClick(index)}>
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
                  type="text"
                  value={row.inventors}
                  onChange={(e) => handleEditChange(index, "inventors", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleEditChange(index, "date", e.target.value)}
                  className="h-5 border-none"
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
                  value={row.patentNumber}
                  onChange={(e) => handleEditChange(index, "patentNumber", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="date"
                  value={row.approvalDate}
                  onChange={(e) => handleEditChange(index, "approvalDate", e.target.value)}
                  className="h-5 border-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="date"
                  value={row.expiryDate}
                  onChange={(e) => handleEditChange(index, "expiryDate", e.target.value)}
                  className="h-5 border-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.patentOffice}
                  onChange={(e) => handleEditChange(index, "patentOffice", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
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
                  <button onClick={() => handleSavePatents(index)} className="text-black rounded-full transition">
                    <div className="relative group ml-3">
                      <SaveIcon size={20} className="cursor-pointer text-green-500" />
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Save
                      </span>
                    </div>
                  </button>
                )}
                {deleteIndex === index && (
                  <div className="flex space-x-1">
                    <span>Delete row?</span>
                    <button onClick={() => handleDeletePatent(index)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Yes
                    </button>
                    <button onClick={handleCancelDelete} className="bg-gray-300 text-black px-2 py-1 rounded">
                      No
                    </button>
                  </div>
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
                type="text"
                disabled
                value={newPatents.inventors}
                onChange={(e) => setNewPatents({ ...newPatents, inventors: e.target.value })}
                placeholder="Inventors"
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
              <select
                disabled
                value={newPatents.status}
                onChange={(e) => setNewPatents({ ...newPatents, status: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Filed">Filed</option>
                <option value="Published">Published</option>
                <option value="Granted">Granted</option>
                <option value="Refused">Refused</option>
              </select>
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newPatents.patentNumber}
                onChange={(e) => setNewPatents({ ...newPatents, patentNumber: e.target.value })}
                placeholder="Patent Number"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="date"
                disabled
                value={newPatents.approvalDate}
                onChange={(e) => setNewPatents({ ...newPatents, approvalDate: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="date"
                disabled
                value={newPatents.expiryDate}
                onChange={(e) => setNewPatents({ ...newPatents, expiryDate: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newPatents.patentOffice}
                onChange={(e) => setNewPatents({ ...newPatents, patentOffice: e.target.value })}
                placeholder="Patent Office"
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
                <div className="relative group">
                  <PlusCircle size={20} />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                    Add Row
                  </span>
                </div>
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default Patents;
