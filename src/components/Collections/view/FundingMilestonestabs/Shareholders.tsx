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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const SHAREHOLDERS_ID = "6735cb6f001a18acd88f";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

interface ShareholdersProps {
  startupId: string;
}

const ShareholderPage: React.FC<ShareholdersProps> = ({ startupId }) => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [allShareholders, setAllShareholders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleSave = async () => {
    try {
      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = data;

      await databases.createDocument(
        DATABASE_ID,
        SHAREHOLDERS_ID,
        "unique()",
        { startupId, ...dataToUpdate }
      );

      setData({});
      setIsEditing(false);
      setIsDialogOpen(false); // Close dialog
      fetchData(); // Refresh table
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <div>
      {/* Shareholder Button */}
      <div className="flex items-center justify-between">
      <h2 className="container text-lg font-medium mb-2 -mt-4">Shareholders</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <DialogTitle>Add Shareholder</DialogTitle>
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
                </div>
                <div>
                  <Label>Is Community Certificate Holder?</Label>
                  <select
                    id="isCommunityHolder"
                    value={data["isCommunityHolder"] || ""}
                    onChange={(e) => handleChange("isCommunityHolder", e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="" disabled>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <Label>Gender</Label>
                  <select
                    id="gender"
                    value={data["gender"] || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                  <select
                    id="isPartner"
                    value={data["isPartner"] || ""}
                    onChange={(e) => handleChange("isPartner", e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="" disabled>Select Partner or Director</option>
                    <option value="Partner">Partner</option>
                    <option value="Director">Director</option>
                  </select>
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
                    type="tel"
                    placeholder="Phone"
                    value={data["phone"] || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
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

              <div className="mt-4">
                <Button type="button" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table for Shareholders */}
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
              <TableHead>Educational Qualifications</TableHead>
              <TableHead>Work Experience</TableHead>
              <TableHead>Associated Companies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allShareholders.map((shareholder) => (
              <TableRow key={shareholder.$id}>
                <TableCell>{shareholder.shareholderName || "N/A"}</TableCell>
                <TableCell>{shareholder.isCommunityHolder || "N/A"}</TableCell>
                <TableCell>{shareholder.gender || "N/A"}</TableCell>
                <TableCell>
                  {shareholder.linkedinProfile ? (
                    <a
                      href={shareholder.linkedinProfile}
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
                <TableCell>{shareholder.educationalQualifications || "N/A"}</TableCell>
                <TableCell>{shareholder.workExperience || "N/A"}</TableCell>
                <TableCell>{shareholder.associatedCompanies || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShareholderPage;
