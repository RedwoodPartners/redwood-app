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
import { Query } from "appwrite";
import { STAGING_DATABASE_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import ButtonWithIcon from "@/lib/addButton";
import { ChevronRightIcon } from "lucide-react";

export const SHAREHOLDERS_ID = "6735cb6f001a18acd88f";

interface ShareholdersProps {
  startupId: string;
}
interface EducationRow {
  qualification: string;
  institution: string;
  fromDate: string;
  toDate: string;
}
interface WorkExperienceRow {
  organisation: string;
  positionDescription: string;
  fromDate: string;
  toDate: string;
}



const ShareholderPage: React.FC<ShareholdersProps> = ({ startupId }) => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [allShareholders, setAllShareholders] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShareholder, setEditingShareholder] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [educationRows, setEducationRows] = useState<EducationRow[]>([]);
  const [workExperienceRows, setWorkExperienceRows] = useState<WorkExperienceRow[]>([]);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        STAGING_DATABASE_ID,
        SHAREHOLDERS_ID,
        [Query.equal("startupId", startupId)]
      );
      const shareholders = response.documents.map((doc) => ({
        ...doc,
        educationalQualifications: doc.educationalQualifications || [],
      }));
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
    if (isSubmitting) return; 
    setIsSubmitting(true);
    
    if (!data["shareholderName"]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        shareholderName: "Shareholder Name is required",
      }));
      setIsSubmitting(false);
      return;
    }
    try {
      const educationalQualifications = educationRows.map(
        (row) => `${row.qualification} at ${row.institution} (${row.fromDate} - ${row.toDate})`
      );

      const formattedWorkExperience = workExperienceRows.map(
        (row) => `${row.organisation} as ${row.positionDescription} (${row.fromDate} - ${row.toDate})`
    );
    

      const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, ...dataToUpdate } = data;
      const updatedData = { ...dataToUpdate, educationalQualifications, workExperience: formattedWorkExperience };

      if (editingShareholder) {
        await databases.updateDocument(STAGING_DATABASE_ID, SHAREHOLDERS_ID, editingShareholder.$id, updatedData);
      } else {
        await databases.createDocument(STAGING_DATABASE_ID, SHAREHOLDERS_ID, "unique()", { startupId, ...updatedData });
      }
      setData({});
      setEditingShareholder(null);
      setIsDialogOpen(false);
      setErrors({});
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
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
          STAGING_DATABASE_ID,
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
  
    // Parse educational qualifications into rows
    const parsedEducationRows = shareholder.educationalQualifications?.map((qualification: string) => {
      const [qual, rest] = qualification.split(" at ");
      const [institution, dateRange] = rest?.split(" (") || [];
      const [fromDate, toDate] = dateRange?.replace(")", "").split(" - ") || [];
      return { qualification: qual || "", institution: institution || "", fromDate: fromDate || "", toDate: toDate || "" };
    }) || [];
    const parsedWorkExperienceRows = shareholder.workExperience?.map((experience: string) => {
      const [org, rest] = experience.split(" as ");
      const [positionDescription, dateRange] = rest?.split(" (") || [];
      const [fromDate, toDate] = dateRange?.replace(")", "").split(" - ") || [];
      return { organisation: org || "", positionDescription: positionDescription || "", fromDate: fromDate || "", toDate: toDate || "" };
  }) || [];
  
    setWorkExperienceRows(parsedWorkExperienceRows);
    setEducationRows(parsedEducationRows);
  };
  
  const handleEducationChange = (index: number, field: keyof EducationRow, value: string) => {
    const updatedRows = [...educationRows];
    updatedRows[index][field] = value;
    setEducationRows(updatedRows);
  };
  

  const addEducationRow = () => {
    setEducationRows([
      ...educationRows,
      { qualification: "", institution: "", fromDate: "", toDate: "" },
    ]);
  };
  
  const educationalQualifications = educationRows.map(
    (row) => `${row.qualification} at ${row.institution} (${row.fromDate} - ${row.toDate})`
  );
  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  const handleWorkExperienceChange = (index: number, field: keyof WorkExperienceRow, value: string) => {
    const updatedRows = [...workExperienceRows];
    updatedRows[index][field] = value;
    setWorkExperienceRows(updatedRows);
  };
  const addWorkExperienceRow = () => {
    setWorkExperienceRows([
        ...workExperienceRows,
        { organisation: "", positionDescription: "", fromDate: "", toDate: "" },
    ]);
  };
  const formattedWorkExperience = workExperienceRows.map(
    (row) => `${row.organisation} as ${row.positionDescription} (${row.fromDate} - ${row.toDate})`
  );
  const removeEducationRow = (index: number) => {
    const updatedRows = educationRows.filter((_, i) => i !== index);
    setEducationRows(updatedRows);
  };
  
  const removeWorkExperienceRow = (index: number) => {
    const updatedRows = workExperienceRows.filter((_, i) => i !== index);
    setWorkExperienceRows(updatedRows);
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
          } else if (!editingShareholder) {
            setData({});
            setEducationRows([]);
            setWorkExperienceRows([]);
          }
        }}>
          <DialogTrigger asChild>
            <button>
              <div className="relative group">
                <ButtonWithIcon label="Add" />
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl max-h-[80vh] overflow-y-auto">
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
              <div className="space-y-2 mt-4">
                <div className="border border-gray-300 rounded-xl p-4">
                  <Label>Educational Qualifications</Label>
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Qualification</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>From Date</TableHead>
                      <TableHead>To Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {educationRows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            placeholder="Qualification"
                            value={row.qualification}
                            onChange={(e) =>
                              handleEducationChange(index, "qualification", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Institution"
                            value={row.institution}
                            onChange={(e) =>
                              handleEducationChange(index, "institution", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.fromDate}
                            onChange={(e) =>
                              handleEducationChange(index, "fromDate", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.toDate}
                            onChange={(e) =>
                              handleEducationChange(index, "toDate", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => removeEducationRow(index)}
                          >
                            -
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant={"outline"} type="button" onClick={addEducationRow} className="mt-2">
                  Add Row
                </Button>
                </div>
                <div>
                <div className="border border-gray-300 rounded-xl p-4">
                  <Label>Work Experience</Label>
                  <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organisation</TableHead>
                            <TableHead>Position Description</TableHead>
                            <TableHead>From Date</TableHead>
                            <TableHead>To Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workExperienceRows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Input
                                        placeholder="Organisation"
                                        value={row.organisation}
                                        onChange={(e) =>
                                            handleWorkExperienceChange(index, "organisation", e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="Position Description"
                                        value={row.positionDescription}
                                        onChange={(e) =>
                                            handleWorkExperienceChange(index, "positionDescription", e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="From Date"
                                        value={row.fromDate}
                                        onChange={(e) =>
                                            handleWorkExperienceChange(index, "fromDate", e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        placeholder="To Date"
                                        value={row.toDate}
                                        onChange={(e) =>
                                            handleWorkExperienceChange(index, "toDate", e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => removeWorkExperienceRow(index)}
                                  >
                                    -
                                  </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                    <Button variant={"outline"} type="button" onClick={addWorkExperienceRow} className="mt-2">
                        Add Row
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                {editingShareholder && (
                  <Button type="button" onClick={handleDelete} className="bg-white text-black border border-black hover:bg-neutral-200">
                    Delete
                  </Button>
                )}
                <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
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
              <TableHead>Gender</TableHead>
              <TableHead>LinkedIn Profile</TableHead>
              <TableHead>Is Partner/Director</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allShareholders.map((shareholder) => (
              <React.Fragment key={shareholder.$id}>
              <TableRow
                key={shareholder.$id}
                onDoubleClick={() => handleDoubleTap(shareholder)}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => toggleRow(shareholder.$id)}
              >
                <TableCell>{shareholder.shareholderName || "N/A"}</TableCell>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(shareholder.$id);
                    }}
                  >
                    <ChevronRightIcon
                      className={`transition-transform ${
                        expandedRow === shareholder.$id ? "rotate-90" : ""
                      }`}
                    />
                  </Button>
                </TableCell>
                  </TableRow>
                  {expandedRow === shareholder.$id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div>
                        {shareholder.educationalQualifications?.length > 0 ? (
                          <div className="border border-gray-300 rounded-xl p-4">
                          <Label>Educational Qualification</Label>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Qualification</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>From Date</TableHead>
                                <TableHead>To Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {shareholder.educationalQualifications.map((qualification: string, index: number) => {
                                // string formatted as "Qualification at Institution (FromDate - ToDate)"
                                const [qual, rest] = qualification.split(" at ");
                                const [institution, dateRange] = rest?.split(" (") || [];
                                const [fromDate, toDate] = dateRange?.replace(")", "").split(" - ") || [];

                                return (
                                  <TableRow key={index}>
                                    <TableCell>{qual || "N/A"}</TableCell>
                                    <TableCell>{institution || "N/A"}</TableCell>
                                    <TableCell>{fromDate || "N/A"}</TableCell>
                                    <TableCell>{toDate || "N/A"}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          </div>
                        ) : (
                          <p>No educational qualifications available.</p>
                        )}
                    {/* Work Experience */}
                    {shareholder.workExperience?.length > 0 && (
                      <div className="mt-4 border border-gray-300 rounded-xl p-4">
                          <Label>Work Experience</Label>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Organisation</TableHead>
                                      <TableHead>Position Description</TableHead>
                                      <TableHead>From Date</TableHead>
                                      <TableHead>To Date</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {shareholder.workExperience.map((experience: string, index: number) => {
                                      const [org, rest] = experience.split(" as ");
                                      const [positionDescription, dateRange] = rest?.split(" (") || [];
                                      const [fromDate, toDate] = dateRange?.replace(")", "").split(" - ") || [];
                                      return (
                                          <TableRow key={index}>
                                              <TableCell>{org || "N/A"}</TableCell>
                                              <TableCell>{positionDescription || "N/A"}</TableCell>
                                              <TableCell>{fromDate || "N/A"}</TableCell>
                                              <TableCell>{toDate || "N/A"}</TableCell>
                                          </TableRow>
                                      );
                                  })}
                              </TableBody>
                          </Table>
                      </div>
                  )}
                  </div>
                </TableCell>
              </TableRow>
            )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShareholderPage;
