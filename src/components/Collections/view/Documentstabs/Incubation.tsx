"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, SaveIcon, Trash2 } from "lucide-react";
import { Query } from "appwrite";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

const INCUBATION_ID = "673c2945001eddd9aea3";

interface IncubationProps {
  startupId: string;
}

const Incubation: React.FC<IncubationProps> = ({ startupId }) => {
  const [incubationData, setIncubationData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [newIncubation, setNewIncubation] = useState({
    program: "",
    date: "",
    exitDate: "",
    status: "",
    spocName: "",
    spocNumber: "",
    spocEmail: "",
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
      setNewIncubation({ program: "", date: "", exitDate: "", status: "", spocName: "", spocNumber: "", spocEmail: "", description: "" });
    } catch (error) {
      console.error("Error adding compliance data:", error);
    }
  };

  const handleDoubleClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleDeleteRow = async (index: number) => {
    try {
      await databases.deleteDocument(DATABASE_ID, INCUBATION_ID, incubationData[index].$id);
      const updatedData = incubationData.filter((_, i) => i !== index);
      setIncubationData(updatedData);
      setDeleteIndex(null);
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteIndex(null);
  };

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Incubation</h3>
      <Table className="border border-gray-300 shadow-lg">
        <TableCaption>Incubation Program Information</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Incubator Name</TableHead>
            <TableHead>Incubated Date</TableHead>
            <TableHead>Exit Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SPOC Name</TableHead>
            <TableHead>SPOC Phone Number</TableHead>
            <TableHead>SPOC Email</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incubationData.map((row, index) => (
            <TableRow key={row.$id} onDoubleClick={() => handleDoubleClick(index)}>
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
                <input
                  type="date"
                  value={row.exitDate}
                  onChange={(e) => handleEditChange(index, "exitDate", e.target.value)}
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
                <input
                  type="text"
                  value={row.spocName}
                  onChange={(e) => handleEditChange(index, "spocName", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.spocNumber}
                  onChange={(e) => handleEditChange(index, "spocNumber", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.spocEmail}
                  onChange={(e) => handleEditChange(index, "spocEmail", e.target.value)}
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
                  <button onClick={() => handleSaveCompliance(index)} className="text-black rounded-full transition">
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
                    <button onClick={() => handleDeleteRow(index)} className="bg-red-500 text-white px-2 py-1 rounded">
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
                type="date"
                disabled
                value={newIncubation.exitDate}
                onChange={(e) => setNewIncubation({ ...newIncubation, exitDate: e.target.value })}
                className="h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <select
                disabled
                value={newIncubation.status}
                onChange={(e) => setNewIncubation({ ...newIncubation, status: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Applied">Applied</option>
                <option value="Incubated">Incubated</option>
                <option value="Exited">Exited</option>
              </select>
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newIncubation.spocName}
                onChange={(e) => setNewIncubation({ ...newIncubation, spocName: e.target.value })}
                placeholder="SPOC Name"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newIncubation.spocNumber}
                onChange={(e) => setNewIncubation({ ...newIncubation, spocNumber: e.target.value })}
                placeholder="SPOC Number"
                className="w-full h-5 border-none focus:outline-none"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newIncubation.spocEmail}
                onChange={(e) => setNewIncubation({ ...newIncubation, spocEmail: e.target.value })}
                placeholder="SPOC Email"
                className="w-full h-5 border-none focus:outline-none"
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

export default Incubation;
