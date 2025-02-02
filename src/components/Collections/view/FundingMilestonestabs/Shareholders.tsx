"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export const SHAREHOLDERS_ID = "6735cb6f001a18acd88f";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

interface ShareholdersProps {
  startupId: string;
}

const ShareholderPage: React.FC<ShareholdersProps> = ({ startupId }) => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [allShareholders, setAllShareholders] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShareholder, setEditingShareholder] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchData = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHAREHOLDERS_ID,
        [Query.equal("startupId", startupId)]
      );
      setAllShareholders(response.documents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [startupId]);

  useEffect(() => {
    if (startupId) fetchData();
  }, [startupId, fetchData]);

  useEffect(() => {
    if (editingShareholder) {
      setData(editingShareholder);
    } else {
      setData({});
    }
    setErrors({});
  }, [editingShareholder]);

  const handleSave = async () => {
    if (!data["shareholderName"]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        shareholderName: "Shareholder Name is required",
      }));
      return;
    }
    try {
      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = data;
      if (editingShareholder) {
        await databases.updateDocument(
          DATABASE_ID,
          SHAREHOLDERS_ID,
          editingShareholder.$id,
          { ...dataToUpdate }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          SHAREHOLDERS_ID,
          "unique()",
          { startupId, ...dataToUpdate }
        );
      }
      setData({});
      setEditingShareholder(null);
      setIsDialogOpen(false);
      setErrors({});
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "Invalid email format" }));
      }
    }
    if (field === "phone") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) {
        setErrors((prevErrors) => ({ ...prevErrors, phone: "Phone number must be 10 digits" }));
      }
    }
  };

  const handleDelete = async () => {
    if (editingShareholder) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          SHAREHOLDERS_ID,
          editingShareholder.$id
        );
        setIsDialogOpen(false);
        setEditingShareholder(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting shareholder:", error);
      }
    }
  };

  const handleDoubleTap = (shareholder: any) => {
    setEditingShareholder(shareholder);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="container text-lg font-medium mb-2 -mt-4">Shareholders</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingShareholder(null);
            setErrors({});
          }
        }}>
          <DialogTrigger asChild>
            <button>
              <div className="relative group">
                <PlusCircle size={20} className="ml-4 mr-3 mb-2" />
                <span className="absolute top-full transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                  Add Shareholder
                </span>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl p-6">
            <DialogHeader>
              <DialogTitle>{editingShareholder ? 'Edit Shareholder' : 'Add Shareholder'}</DialogTitle>
              <DialogDescription aria-describedby={undefined}>
              </DialogDescription>
            </DialogHeader>
            <form>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Shareholder Name</Label>
                  <Input
                    id="shareholderName"
                    type="text"
                    placeholder="Shareholder Name"
                    value={data["shareholderName"] || ""}
                    onChange={(e) => handleChange("shareholderName", e.target.value)}
                  />
                  {errors.shareholderName && (
                    <p className="text-red-500 text-sm mt-1">{errors.shareholderName}</p>
                  )}
                </div>
                <div>
                  <Label>Is Community Certificate Holder?</Label>
                  <Select
                    value={data["isCommunityHolder"] || ""}
                    onValueChange={(value) => handleChange("isCommunityHolder", value)}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={data["gender"] || ""}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>LinkedIn Profile</Label>
                  <Input
                    id="linkedinProfile"
                    type="url"
                    placeholder="url:"
                    value={data["linkedinProfile"] || ""}
                    onChange={(e) => handleChange("linkedinProfile", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <Label>Is Partner/Director?</Label>
                  <Select
                    value={data["isPartner"] || ""}
                    onValueChange={(value) => handleChange("isPartner", value)}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                      <SelectValue placeholder="Partner/Director" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Director Identification Number</Label>
                  <Input
                    id="directorId"
                    type="text"
                    placeholder="Identification Number"
                    value={data["directorId"] || ""}
                    onChange={(e) => handleChange("directorId", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    id="phone"
                    type="number"
                    placeholder="Phone"
                    value={data["phone"] || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={data["email"] || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <Label>Educational Qualifications</Label>
                  <Textarea
                    id="educationalQualifications"
                    placeholder="Educational Qualifications"
                    value={data["educationalQualifications"] || ""}
                    onChange={(e) => handleChange("educationalQualifications", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Work Experience</Label>
                  <Textarea
                    id="workExperience"
                    placeholder="Work Experience"
                    value={data["workExperience"] || ""}
                    onChange={(e) => handleChange("workExperience", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Associated Companies</Label>
                  <Textarea
                    id="associatedCompanies"
                    placeholder="Associated Companies"
                    value={data["associatedCompanies"] || ""}
                    onChange={(e) => handleChange("associatedCompanies", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                {editingShareholder && (
                  <Button type="button" onClick={handleDelete} className="bg-white text-black border border-black hover:bg-neutral-200">
                    Delete
                  </Button>
                )}
                <Button type="button" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-6 p-3 bg-white shadow-md rounded-lg border border-gray-300">
        <Table>
          <TableCaption>A list of all shareholders for this startup</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Is Community Certificate Holder</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>LinkedIn Profile</TableHead>
              <TableHead>Is Partner/Director</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allShareholders.map((shareholder) => (
              <TableRow
                key={shareholder.$id}
                onDoubleClick={() => handleDoubleTap(shareholder)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{shareholder.shareholderName || "N/A"}</TableCell>
                <TableCell>{shareholder.isCommunityHolder || "N/A"}</TableCell>
                <TableCell>{shareholder.gender || "N/A"}</TableCell>
                <TableCell>
                  {shareholder.linkedinProfile ? (
                    <a
                    href={
                      shareholder.linkedinProfile.startsWith("http")
                        ? shareholder.linkedinProfile
                        : `https://${shareholder.linkedinProfile}`
                    }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      LinkedIn
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>{shareholder.isPartner || "N/A"}</TableCell>
                <TableCell>{shareholder.email || "N/A"}</TableCell>
                <TableCell>{shareholder.phone || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShareholderPage;
