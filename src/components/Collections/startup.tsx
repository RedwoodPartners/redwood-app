"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaSearch } from 'react-icons/fa';
import { PlusCircle, Trash } from "lucide-react";
import { DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import {nanoid} from "nanoid";
import LoadingSpinner from "../ui/loading";

type Startup = {
  id: string;
  name: string;
  brandName: string;
  revenue: string;
  year: string;
  description: string;
};

type Document = {
  $id: string;
  [key: string]: any;
};

const StartupsPage: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [year, setYear] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
        const startupData = response.documents.map((doc: Document) => ({
          id: doc.$id,
          name: doc.name || "",
          brandName: doc.brandName || "",
          revenue: doc.revenue || "0",
          year: doc.year || "",
          description: doc.description || "",
        }));
        setStartups(startupData);
        setFilteredStartups(startupData);
      } catch (error) {
        console.error("Error fetching startups:", error);
      }finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  useEffect(() => {
    const filtered = startups.filter((startup) =>
      startup.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.year.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStartups(filtered);
  }, [searchTerm, startups]);

  const handleAddStartup = () => {
    setShowAddDialog(true);
  };

  const createAndRedirect = async (newStartupData: Partial<Startup>) => {
    
    const shortUUID = nanoid(6);
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const createdStartup = await databases.createDocument(DATABASE_ID, STARTUP_ID, shortUUID, { ...newStartupData, year: year });
      setShowAddDialog(false);
      router.push(`/startup/${createdStartup.$id}`);
    } catch (error) {
      console.error("Error adding startup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create startup. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSelected = async () => {
    try {
      await Promise.all(
        selectedStartups.map((id) => databases.deleteDocument(DATABASE_ID, STARTUP_ID, id))
      );
      setStartups((prev) => prev.filter((startup) => !selectedStartups.includes(startup.id)));
      setFilteredStartups((prev) => prev.filter((startup) => !selectedStartups.includes(startup.id)));
      setSelectedStartups([]);
    } catch (error) {
      console.error("Error deleting startups:", error);
    }
  };

  const handleViewStartup = (id: string) => {
    router.push(`/startup/${id}`);
  };

  const toggleStartupSelection = (id: string) => {
    setSelectedStartups((prev) =>
      prev.includes(id) ? prev.filter((startupId) => startupId !== id) : [...prev, id]
    );
  };

  const handleEditStartup = (startup: Startup) => {
    setEditingStartup(startup);
    setYear(startup.year);
    setShowEditDialog(true);
  };

  const handleSaveChanges = async (updatedStartupData: Startup) => {
    try {
      await databases.updateDocument(DATABASE_ID, STARTUP_ID, updatedStartupData.id, {
        ...updatedStartupData,
        year
      });
      setStartups((prev) =>
        prev.map((startup) => (startup.id === updatedStartupData.id ? { ...updatedStartupData, year } : startup))
      );
      setFilteredStartups((prev) =>
        prev.map((startup) => (startup.id === updatedStartupData.id ? { ...updatedStartupData, year } : startup))
      );
      setShowEditDialog(false);
      setEditingStartup(null);
      toast({
        title: "Success",
        description: "Startup details updated successfully.",
      });
    } catch (error) {
      console.error("Error updating startup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update startup. Please try again.",
      });
    }
  };

  return (
    <div className="p-2 mx-auto">
      <div className="flex space-x-3 mb-4">
        <h1 className="text-2xl font-semibold">Startups</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <button className="text-black rounded-full transition hover:text-green-500 focus:outline-none">
              <div className="relative group">
                <PlusCircle size={20} />
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap">
                  Add new Startup
                </span>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-lg p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Add New Startup</DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the details to add a new startup.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newStartupData = Object.fromEntries(formData.entries());
                createAndRedirect(newStartupData as Partial<Startup>);
              }}
            >
              <div className="grid grid-rows-1 gap-1">
              <div>
                <Label>Startup Name</Label>
                <Input type="text" name="name" placeholder="Startup Name" className="w-full p-2 mb-2 border rounded" required />
              </div>
              <div>
                <Label>Brand Name</Label>
                <Input type="text" name="brandName" placeholder="Brand Name" className="w-full p-2 mb-2 border rounded" required />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={(selectedYear) => setYear(selectedYear)}>
                    <SelectTrigger id="year" name="year" className="w-full p-2 mb-2 border rounded">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 2031 - 2020 }, (_, i) => 2020 + i).map((yearOption) => (
                        <SelectItem key={yearOption} value={String(yearOption)}>
                          {yearOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div>
                <Label>Remarks</Label>
                <Textarea name="description" placeholder="Remarks" className="w-full p-2 mb-2 border rounded" rows={3}></Textarea>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Startup"}
                </Button>
              </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <button
          onClick={handleRemoveSelected}
          className="text-black rounded-full transition hover:text-red-500 focus:outline-none"
        >
          <div className="relative group">
            <Trash size={20} />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap">
              Remove selected Startup
            </span>
          </div>
        </button>
      </div>

      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search by ID, Startup Name, or Year"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-72 text-xs pl-10 pr-4 py-2 border rounded-lg"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
       {/* Loading Indicator */}
      {loading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
      <div className="bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6">Select</TableHead>
              <TableHead className="w-10">View</TableHead>
              <TableHead className="w-auto">Startup Name</TableHead>
              <TableHead className="w-auto">Brand Name</TableHead>
              <TableHead>Revenue (last FY)</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStartups.map((startup) => (
              <TableRow key={startup.id} onDoubleClick={() => handleEditStartup(startup)}>
                <TableCell>
                  <Checkbox
                    checked={selectedStartups.includes(startup.id)}
                    onCheckedChange={() => toggleStartupSelection(startup.id)}
                  />
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleViewStartup(startup.id)}
                    className="bg-transparent text-gray-600 hover:text-blue-700 px-2 py-1 border border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50"
                    title="View Startup"
                  >
                    <FaEye size={18} />
                  </button>
                </TableCell>
                
                <TableCell
                  onClick={() => handleViewStartup(startup.id)}
                  className="cursor-pointer hover:text-blue-700"
                >{startup.name}</TableCell>
                <TableCell>{startup.brandName}</TableCell>
                <TableCell>₹ {startup.revenue}</TableCell>
                <TableCell>{startup.year}</TableCell>
                <TableCell>{startup.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>)}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Edit Startup</DialogTitle>
            <DialogDescription className="text-sm">
              Edit the details of the startup.
            </DialogDescription>
          </DialogHeader>
          {editingStartup && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedStartupData = {
                  ...editingStartup,
                  ...Object.fromEntries(formData.entries()),
                } as Startup;
                handleSaveChanges(updatedStartupData);
              }}
            >
              <Label>Startup Name</Label>
              <Input type="text" name="name" placeholder="Startup Name" className="w-full p-2 mb-2 border rounded" defaultValue={editingStartup.name} required />
              <Label>Brand Name</Label>
              <Input type="text" name="brandName" placeholder="Brand Name" className="w-full p-2 mb-2 border rounded" defaultValue={editingStartup.brandName} required />
              <Label>Revenue</Label>
              <Input type="number" name="revenue" placeholder="Revenue" className="w-full p-2 mb-2 border rounded" defaultValue={editingStartup.revenue} />

              <Label>Year</Label>
              <Select value={year} onValueChange={(selectedYear) => setYear(selectedYear)}>
              <SelectTrigger id="edit-year" name="year" className="w-full p-2 mb-2 border rounded">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 2031 - 2020 }, (_, i) => 2020 + i).map((yearOption) => (
                  <SelectItem key={yearOption} value={String(yearOption)}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>

              
              <Label>Remarks</Label>
              <Textarea name="description" placeholder="Remarks" className="w-full p-2 mb-2 border rounded" rows={3} defaultValue={editingStartup.description}></Textarea>
              <div className="flex justify-end mt-4">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartupsPage;
