"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, SaveIcon, Trash2 } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

export const CAP_TABLE_ID = "67339ad7000ee8d123a9";

interface CapTableProps {
  startupId: string;
}

const CapTable: React.FC<CapTableProps> = ({ startupId }) => {
  const [capTableData, setCapTableData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [newInvestment, setNewInvestment] = useState({
    round: "",
    shareholderName: "",
    role: "",
    capitalStructure: "",
  });

  const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
  const databases = new Databases(client);

  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);
    const fetchCapTableData = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, CAP_TABLE_ID, [
          Query.equal("startupId", startupId),
        ]);
        setCapTableData(response.documents);
      } catch (error) {
        console.error("Error fetching cap table data:", error);
      }
    };
    fetchCapTableData();
  }, [startupId]);

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedCapTableData = [...capTableData];
    updatedCapTableData[index][field] = value;
    setCapTableData(updatedCapTableData);
    setEditingIndex(index);
  };

  const handleSaveInvestment = async (index: number) => {
    const dataToUpdate = capTableData[index];
    const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...fieldsToUpdate } = dataToUpdate;
    try {
      await databases.updateDocument(DATABASE_ID, CAP_TABLE_ID, $id, fieldsToUpdate);
      console.log("Saved successfully");
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving cap table data:", error);
    }
  };

  const handleAddCapTableData = async () => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        CAP_TABLE_ID,
        "unique()",
        { ...newInvestment, startupId }
      );
      setCapTableData([...capTableData, response]);
      setNewInvestment({
        round: "",
        shareholderName: "",
        role: "",
        capitalStructure: "",
      });
    } catch (error) {
      console.error("Error adding cap table data:", error);
    }
  };

  const handleDeleteRow = async (index: number) => {
    try {
      await databases.deleteDocument(DATABASE_ID, CAP_TABLE_ID, capTableData[index].$id);
      const updatedCapTableData = capTableData.filter((_, i) => i !== index);
      setCapTableData(updatedCapTableData);
      setDeletingIndex(null);
    } catch (error) {
      console.error("Error deleting cap table data:", error);
    }
  };

  const calculateTotalCapital = () => {
    return capTableData.reduce((total, row) => {
      const value = parseFloat(row.capitalStructure.replace("%", "")) || 0;
      return total + value;
    }, 0);
  };

  const roleOptions = [
    "Founder", "Co-Founder", "Employee", "Advisor", "Angel Investor",
    "Venture Capitalist", "Board Member", "Institutional Investor",
    "Seed Investor", "Series A Investor", "Series B Investor",
    "Series C and Beyond Investors", "Convertible Note Holder",
    "Preferred Stock Holder", "Common Stock Holder",
    "Employee Stock Option Plan (ESOP) Holder", "Strategic Investor",
    "Lead Investor", "Syndicate Member", "Secondary Market Investor",
  ];

  return (
    <div>
      <h3 className="container text-lg font-medium mb-2 -mt-4">Capital Table</h3>
      <Table className="border border-gray-300 shadow-lg bg-white">
        <TableCaption>A list of capital contributions.</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Round Name</TableHead>
            <TableHead>Shareholder Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Capital Structure (%)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capTableData.map((row, index) => (
            <TableRow key={row.$id} onDoubleClick={() => setDeletingIndex(index)}>
              <TableCell>
                <input
                  type="text"
                  value={row.round}
                  onChange={(e) => handleEditChange(index, "round", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.shareholderName}
                  onChange={(e) => handleEditChange(index, "shareholderName", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                <select
                  value={row.role}
                  onChange={(e) => handleEditChange(index, "role", e.target.value)}
                  className="h-5 border-none border-gray-300 rounded focus:outline-none"
                >
                  <option value="" disabled>Select Role</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.capitalStructure}
                  onChange={(e) => handleEditChange(index, "capitalStructure", e.target.value)}
                  className="w-full h-5 border-none focus:outline-none"
                />
              </TableCell>
              <TableCell>
                {editingIndex === index && (
                  <button onClick={() => handleSaveInvestment(index)} className="text-black rounded-full transition">
                    <div className="relative group ml-3">
                      <SaveIcon size={20} className="cursor-pointer text-green-500" />
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Save
                      </span>
                    </div>
                  </button>
                )}
                {deletingIndex === index && (
                  <div className="flex items-center space-x-2">
                    <span>Delete row?</span>
                    <button onClick={() => handleDeleteRow(index)} className="bg-red-500 text-white px-2 py-1 rounded">Yes</button>
                    <button onClick={() => setDeletingIndex(null)} className="bg-gray-300 text-black px-2 py-1 rounded">No</button>
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
                value={newInvestment.round}
                onChange={(e) => setNewInvestment({ ...newInvestment, round: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Round Name"
              />
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newInvestment.shareholderName}
                onChange={(e) => setNewInvestment({ ...newInvestment, shareholderName: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Shareholder Name"
              />
            </TableCell>
            <TableCell>
              <select
                disabled
                value={newInvestment.role}
                onChange={(e) => setNewInvestment({ ...newInvestment, role: e.target.value })}
                className="w-full h-5 border-none rounded focus:outline-none"
              >
                <option value="" disabled>Select Role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </TableCell>
            <TableCell>
              <input
                type="text"
                disabled
                value={newInvestment.capitalStructure}
                onChange={(e) => setNewInvestment({ ...newInvestment, capitalStructure: e.target.value })}
                className="w-full h-5 border-none focus:outline-none"
                placeholder="Capital Structure (%)"
              />
            </TableCell>
            <TableCell>
              <button onClick={handleAddCapTableData} className="text-black rounded-full transition">
                <div className="relative group">
                  <PlusCircle size={20} />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                    Add Row
                  </span>
                </div>
              </button>
            </TableCell>
          </TableRow>
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={3} className="text-right">Total Capital Structure:</TableCell>
            <TableCell className="text-right">{calculateTotalCapital()}%</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default CapTable;
