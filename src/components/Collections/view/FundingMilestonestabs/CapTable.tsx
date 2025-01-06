"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { Client, Databases } from "appwrite";
import { Query } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CAP_TABLE_ID = "67339ad7000ee8d123a9";

interface CapTableProps {
  startupId: string;
}

const CapTable: React.FC<CapTableProps> = ({ startupId }) => {
  const [capTableData, setCapTableData] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const databases = useMemo(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    return new Databases(client);
  }, []);

  const fetchCapTableData = useCallback(async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, CAP_TABLE_ID, [
        Query.equal("startupId", startupId),
      ]);
      setCapTableData(response.documents);
    } catch (error) {
      console.error("Error fetching cap table data:", error);
    }
  }, [databases, startupId]);

  useEffect(() => {
    fetchCapTableData();
  }, [fetchCapTableData]);

  const calculateTotalCapital = (): number => {
    return capTableData.reduce((total, row) => {
      if (row.capitalStructure && typeof row.capitalStructure === 'string') {
        const value = parseFloat(row.capitalStructure.replace("%", "")) || 0;
        return total + value;
      }
      return total;
    }, 0);
  };

  const handleSaveInvestment = async (row: any) => {
    try {
      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, $permissions, ...fieldsToUpdate } = row;
      const newCapitalStructure = fieldsToUpdate.capitalStructure ? parseFloat(fieldsToUpdate.capitalStructure.replace("%", "")) || 0 : null;
      
      let totalCapital = calculateTotalCapital();
      if ($id) {
        const existingRow = capTableData.find(r => r.$id === $id);
        const existingCapital = existingRow?.capitalStructure ? parseFloat(existingRow.capitalStructure.replace("%", "")) || 0 : 0;
        totalCapital = totalCapital - existingCapital + (newCapitalStructure || 0);
      } else if (newCapitalStructure !== null) {
        totalCapital += newCapitalStructure;
      }
  
      if (totalCapital > 100) {
        setError("Total Capital Structure cannot exceed 100%");
        return;
      }
  
      if ($id) {
        await databases.updateDocument(DATABASE_ID, CAP_TABLE_ID, $id, fieldsToUpdate);
      } else {
        await databases.createDocument(DATABASE_ID, CAP_TABLE_ID, "unique()", {
          ...fieldsToUpdate,
          startupId,
        });
      }
      
      fetchCapTableData();
      setIsDialogOpen(false);
      setEditingRow(null);
      setError(null);
    } catch (error) {
      console.error("Error saving cap table data:", error);
      setError("An error occurred while saving the data");
    }
  };
  

  const handleDeleteRow = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, CAP_TABLE_ID, id);
      fetchCapTableData();
      setIsDialogOpen(false);
      setEditingRow(null);
    } catch (error) {
      console.error("Error deleting cap table data:", error);
    }
  };

  const roleOptions = [
    "Select", "Founder", "Co-Founder", "Employee", "Advisor", "Angel Investor", "Venture Capitalist",
    "Board Member", "Institutional Investor", "Seed Investor", "Series A Investor",
    "Series B Investor", "Series C and Beyond Investors", "Convertible Note Holder",
    "Preferred Stock Holder", "Common Stock Holder", "Employee Stock Option Plan (ESOP) Holder",
    "Strategic Investor", "Lead Investor", "Syndicate Member", "Secondary Market Investor",
  ];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="container text-lg font-medium mb-2 -mt-4">Capital Table</h3>
        <div onClick={() => {
          setEditingRow({});
          setIsDialogOpen(true);
          setError(null);
        }}>
          <PlusCircle size={20} className="mr-2 mb-2 cursor-pointer" />
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setError(null);
          setEditingRow(null);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingRow?.$id ? "Edit" : "Add"} Investment</DialogTitle>
            <DialogDescription aria-describedby={undefined}>
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveInvestment(editingRow);
          }}>
            <div className="flex flex-row gap-4 py-4">
              <div className="flex-1">
                <Label htmlFor="round" className="block mb-2">Round Name</Label>
                <Input id="round" placeholder="Round Name" value={editingRow?.round || ""} onChange={(e) => setEditingRow({ ...editingRow, round: e.target.value })} />
              </div>
              <div className="flex-1">
                <Label htmlFor="shareholderName" className="block mb-2">Shareholder Name</Label>
                <Input id="shareholderName" placeholder="Shareholder Name" value={editingRow?.shareholderName || ""} onChange={(e) => setEditingRow({ ...editingRow, shareholderName: e.target.value })} />
              </div>
              <div className="flex-1">
                <Label htmlFor="role" className="block mb-2">Role</Label>
                <Select value={editingRow?.role || ""} onValueChange={(value) => setEditingRow({ ...editingRow, role: value })}>
                  <SelectTrigger id="role" className="w-full p-2 text-sm border border-gray-300 rounded">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="-mb-10">
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="capitalStructure" className="block mb-2">Capital Structure (%)</Label>
                <Input id="capitalStructure" placeholder="Capital Structure (%)" value={editingRow?.capitalStructure || ""} onChange={(e) => setEditingRow({ ...editingRow, capitalStructure: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              {editingRow?.$id && (
                <Button type="button" onClick={() => handleDeleteRow(editingRow.$id)} className="bg-white text-black border border-black hover:bg-neutral-200">
                  Delete
                </Button>
              )}
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="bg-white p-1 shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of capital contributions.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Round Name</TableHead>
              <TableHead>Shareholder Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Capital Structure (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capTableData.map((row) => (
              <TableRow key={row.$id} onDoubleClick={() => {
                setEditingRow(row);
                setIsDialogOpen(true);
              }} className="cursor-pointer hover:bg-gray-100">
                <TableCell>{row.round}</TableCell>
                <TableCell>{row.shareholderName}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.capitalStructure}</TableCell>
              </TableRow>
            ))}
            <TableRow className={`font-semibold ${calculateTotalCapital() > 100 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
              <TableCell colSpan={3} className="text-right">Total Capital Structure:</TableCell>
              <TableCell className="text-left">{calculateTotalCapital().toFixed(2)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CapTable;
