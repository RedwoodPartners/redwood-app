"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Client, Databases, Query } from "appwrite";
import { STAGING_DATABASE_ID, PROJECT_ID } from "@/appwrite/config";
import { client, databases } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ESIC_COLLECTION_ID = "680b1b650005926f5e73";
export const ESIC_EPF_COLLECTION_ID = "680c6d34001344787fd8";

interface Contribution {
    $id?: string;
    month: string;
    employerContribution: string;
    ipContribution: string;
    totalContribution: string;
    epfContribution: string;
    contributionRemitted: string;
    totalRemitted: string;
}

interface ESICDetailsProps {
    startupId: string;
    setIsDirty: (isDirty: boolean) => void;
}

const months: string[] = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
];

const ESICDetails: React.FC<ESICDetailsProps> = ({ startupId, setIsDirty }) => {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [isEditingESIC, setIsEditingESIC] = useState(false);
    const [isEditingEPF, setIsEditingEPF] = useState(false);
    const [financialYear, setFinancialYear] = useState("");
    const [financialYear2, setFinancialYear2] = useState("");
    const [employerCode, setEmployerCode] = useState("");
    const [establishmentId, setEstablishmentId] = useState("");
    const [note, setNote] = useState("");
    const [note2, setNote2] = useState("");
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [isEditingMetadata2, setIsEditingMetadata2] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await databases.listDocuments(
                    STAGING_DATABASE_ID,
                    ESIC_COLLECTION_ID,
                    [Query.equal("startupId", startupId)]
                );

                const fetchedData = months.map((month) => {
                    const existing = response.documents.find(
                        (doc) => doc.month === month && doc.startupId === startupId
                    );
                    return {
                        $id: existing?.$id,
                        month: month,
                        employerContribution: existing?.employerContribution || "",
                        ipContribution: existing?.ipContribution || "",
                        totalContribution: existing?.totalContribution || "",
                        epfContribution: existing?.epfContribution || "",
                        contributionRemitted: existing?.contributionRemitted || "",
                        totalRemitted: existing?.totalRemitted || "",
                        startupId: startupId, // Include startupId in the data
                    };
                });

                setContributions(fetchedData);
            } catch (error) {
                console.error("Failed to fetch ESIC details:", error);
            }
        };
        const fetchMetadata = async () => {
            try {
              const metadataResponse = await databases.listDocuments(
                STAGING_DATABASE_ID,
                ESIC_EPF_COLLECTION_ID,  
                [Query.equal("startupId", startupId)]
              );
      
              if (metadataResponse.documents.length > 0) {
                const metadata = metadataResponse.documents[0];
                setFinancialYear(metadata.financialYear || "");
                setEmployerCode(metadata.employerCode ? metadata.employerCode.toString() : ""); 
                setNote(metadata.note || "");
                setFinancialYear2(metadata.financialYear2 || "");
                setEstablishmentId(metadata.establishmentId ? metadata.establishmentId.toString() : ""); 
                setNote2(metadata.note2 || "");
              }
            } catch (error) {
              console.error("Failed to fetch ESIC metadata:", error);
            }
          };
          fetchMetadata();
          fetchData();
    }, [startupId]);

    const handleInputChange = (
        index: number,
        field: keyof Contribution,
        value: string
    ) => {
        const updated = [...contributions];
        updated[index][field] = value;

        if (field !== "totalContribution" && isEditingESIC) {
            const emp = parseFloat(updated[index].employerContribution) || 0;
            const ip = parseFloat(updated[index].ipContribution) || 0;
            updated[index].totalContribution = (emp + ip).toString();
        }
        if (field !== "totalRemitted" && isEditingEPF) {
            const emp = parseFloat(updated[index].epfContribution) || 0;
            const ip = parseFloat(updated[index].contributionRemitted) || 0;
            updated[index].totalRemitted = (emp + ip).toString();
        }
        setContributions(updated);
        setIsDirty(true);
    };

    const handleEditClickESIC = () => {
        setIsEditingESIC(true);
        setIsEditingMetadata(true)
        setIsDirty(true);
    };

    const handleSaveClickESIC = async () => {
        await saveContributions(contributions);
        await handleSaveMetadata();
        setIsEditingESIC(false);
        setIsEditingMetadata(false)
        setIsDirty(false);
    };

    const handleEditClickEPF = () => {
        setIsEditingEPF(true);
        setIsEditingMetadata2(true);
        setIsDirty(true);
    };

    const handleSaveClickEPF = async () => {
        await saveContributions(contributions);
        await handleSaveMetadata();
        setIsEditingMetadata2(false);
        setIsEditingEPF(false);
        setIsDirty(false);
    };

    const saveContributions = async (contributions: Contribution[]) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const promises = contributions.map(async (contribution) => {
                const data = {
                    startupId: startupId,
                    month: contribution.month,
                    employerContribution: contribution.employerContribution,
                    ipContribution: contribution.ipContribution,
                    totalContribution: contribution.totalContribution,
                    epfContribution: contribution.epfContribution,
                    contributionRemitted: contribution.contributionRemitted,
                    totalRemitted: contribution.totalRemitted,
                };

                if (contribution.$id) {
                    // Update existing document
                    return databases.updateDocument(
                        STAGING_DATABASE_ID,
                        ESIC_COLLECTION_ID,
                        contribution.$id,
                        data
                    );
                } else {
                    // Check if a document with the same startupId and month exists
                    const existingDocuments = await databases.listDocuments(
                        STAGING_DATABASE_ID,
                        ESIC_COLLECTION_ID,
                        [
                            Query.equal("startupId", startupId),
                            Query.equal("month", contribution.month),
                        ]
                    );

                    if (existingDocuments.total > 0) {
                        // Update the existing document
                        const existingDocumentId = existingDocuments.documents[0].$id;
                        return databases.updateDocument(
                            STAGING_DATABASE_ID,
                            ESIC_COLLECTION_ID,
                            existingDocumentId,
                            data
                        );
                    } else {
                        // Create a new document
                        return databases.createDocument(
                            STAGING_DATABASE_ID,
                            ESIC_COLLECTION_ID,
                            "unique()",
                            data
                        );
                    }
                }
            });

            await Promise.all(promises);
            setIsDirty(false);
        } catch (error) {
            console.error("Error saving details:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveMetadata = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
          const metadataResponse = await databases.listDocuments(
            STAGING_DATABASE_ID,
            ESIC_EPF_COLLECTION_ID, 
            [Query.equal("startupId", startupId)]
          );
      
          const data = {
            startupId: startupId,
            financialYear: financialYear,
            employerCode: employerCode,
            note: note,
            financialYear2: financialYear2,
            establishmentId: establishmentId,
            note2: note2,
          };
      
          if (metadataResponse.total > 0) {
            // Update existing document
            await databases.updateDocument(
              STAGING_DATABASE_ID,
              ESIC_EPF_COLLECTION_ID,  
              metadataResponse.documents[0].$id,
              data
            );
          } else {
            // Create a new document
            await databases.createDocument(
              STAGING_DATABASE_ID,
              ESIC_EPF_COLLECTION_ID,  
              "unique()",
              data
            );
          }
      
          setIsEditingMetadata(false);
        } catch (error) {
          console.error("Error saving ESIC metadata:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    // Calculate totals for ESIC
    const employerContributionTotal = contributions.reduce(
        (acc, curr) => acc + parseFloat(curr.employerContribution || "0"),
        0
    );
    const ipContributionTotal = contributions.reduce(
        (acc, curr) => acc + parseFloat(curr.ipContribution || "0"),
        0
    );
    const totalContributionTotal = contributions.reduce(
        (acc, curr) => acc + parseFloat(curr.totalContribution || "0"),
        0
    );

    // Calculate totals for EPF
    const epfContributionTotal = contributions.reduce(
        (acc, curr) => acc + parseFloat(curr.epfContribution || "0"),
        0
    );
    const contributionRemittedTotal = contributions.reduce(
        (acc, curr) => acc + parseFloat(curr.contributionRemitted || "0"),
        0
    );
    const totalRemittedTotal = contributions.reduce(
        (acc, curr) => acc + parseFloat(curr.totalRemitted || "0"),
        0
    );
    
      

    return (
        <div>
          <Label>
              Employee State Insurance (ESIC) & Employee Provident Fund (EPF)
              Compliances
          </Label>
          <div>
            <div className="flex items-center space-x-2 p-1 mt-2">
            <Label className="text-lg">Employee State Insurance (ESIC)</Label>
              <div>
                {!isEditingESIC ? (
                  <Button
                      className="h-7"
                      onClick={handleEditClickESIC}
                      variant={"outline"}
                  >
                      Edit ESIC
                  </Button>
                ) : (
                  <Button className="h-7" onClick={handleSaveClickESIC} disabled={isSubmitting}>
                      {isSubmitting ? "Saving.." : "Save ESIC"}
                  </Button>
                )}
              </div>
            </div>
            
              <div className="border border-gray-300 bg-white rounded-xl p-2">
              <div className="grid grid-cols-3 p-2 space-x-2">
                <div>
                <Label>Financial Year</Label>
                <Select
                    value={financialYear}
                    onValueChange={(value) => setFinancialYear(value)}
                    disabled={!isEditingMetadata}
                    >
                    <SelectTrigger id="financialYear">
                        <SelectValue placeholder="Select Financial Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FY 25">FY 25</SelectItem>
                        <SelectItem value="FY 24">FY 24</SelectItem>
                        <SelectItem value="FY 23">FY 23</SelectItem>
                        <SelectItem value="FY 22">FY 22</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Label>Employer Code</Label>
                <Input 
                    type="number"
                    id="employerCode"
                    value={employerCode}
                    onChange={(e) => setEmployerCode(e.target.value)}
                    disabled={!isEditingMetadata}
                />
                </div>
                <div>
                <Label>Note</Label>
                <Textarea
                    id="note"
                    className="resize-none"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={!isEditingMetadata}
                />
                </div>
            </div>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Employer Contribution (₹)</TableHead>
                    <TableHead>IP Contribution (₹)</TableHead>
                    <TableHead>Total Contribution (₹)</TableHead>
                    </TableRow>
                </TableHeader>
                    <TableBody>
                    {contributions.map((contribution, idx) => (
                    <TableRow key={contribution.month}>
                        <TableCell>{contribution.month}</TableCell>
                        <TableCell>
                            {isEditingESIC ? (
                            <Input
                                type="number"
                                value={contribution.employerContribution}
                                onChange={(e) =>
                                    handleInputChange(
                                        idx,
                                        "employerContribution",
                                        e.target.value
                                    )
                                }
                            />
                            ) : (
                                contribution.employerContribution
                            )}
                        </TableCell>
                        <TableCell>
                            {isEditingESIC ? (
                            <Input
                                type="number"
                                value={contribution.ipContribution}
                                onChange={(e) =>
                                    handleInputChange(
                                        idx,
                                        "ipContribution",
                                        e.target.value
                                    )
                                }
                            />
                            ) : (
                                contribution.ipContribution
                            )}
                        </TableCell>
                        <TableCell>
                            {isEditingESIC ? (
                                <Input
                                    type="number"
                                    disabled
                                    value={contribution.totalContribution}
                                    onChange={(e) =>
                                        handleInputChange(
                                            idx,
                                            "totalContribution",
                                            e.target.value
                                        )
                                    }
                                />
                            ) : (
                                contribution.totalContribution
                            )}
                        </TableCell>
                    </TableRow>
                    ))}
                    <TableRow>
                        <TableCell>Total</TableCell>
                        <TableCell>{employerContributionTotal}</TableCell>
                        <TableCell>{ipContributionTotal}</TableCell>
                        <TableCell>{totalContributionTotal}</TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
              </div>
          </div>
            <div>
            <div className="flex items-center space-x-2 p-1 mt-6">
            <Label className="text-lg">Employee Provident Fund (EPF)</Label>
            <div>
                {!isEditingEPF ? (
                    <Button
                        className="h-7"
                        onClick={handleEditClickEPF}
                        variant={"outline"}
                    >
                        Edit EPF
                    </Button>
                ) : (
                    <Button className="h-7" onClick={handleSaveClickEPF} disabled={isSubmitting}>
                       {isSubmitting ? "Saving.." : "Save EPF"}
                    </Button>
                )}
            </div>
            </div>
            <div className="border border-gray-300 bg-white rounded-xl p-2">
            <div className="grid grid-cols-3 p-2 space-x-2">
                <div>
                <Label>Financial Year</Label>
                <Select
                    value={financialYear2}
                    onValueChange={(value) => setFinancialYear2(value)}
                    disabled={!isEditingMetadata2}
                    >
                    <SelectTrigger id="financialYear2">
                        <SelectValue placeholder="Select Financial Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FY 25">FY 25</SelectItem>
                        <SelectItem value="FY 24">FY 24</SelectItem>
                        <SelectItem value="FY 23">FY 23</SelectItem>
                        <SelectItem value="FY 22">FY 22</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Label>Establishment ID</Label>
                <Input 
                    type="number"
                    id="establishmentId"
                    value={establishmentId}
                    onChange={(e) => setEstablishmentId(e.target.value)}
                    disabled={!isEditingMetadata2}
                />
                </div>
                <div>
                <Label>Note</Label>
                <Textarea
                    id="note2"
                    className="resize-none"
                    value={note2}
                    onChange={(e) => setNote2(e.target.value)}
                    disabled={!isEditingMetadata2}
                />
                </div>
            </div>
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>EPF Contribution Remitted (Amount in ₹)</TableHead>
                    <TableHead>Total EPF-EPS Contribution Remitted (Amount in ₹)</TableHead>
                    <TableHead>Total EPS Contribution Remitted (Amount in ₹) </TableHead>
                </TableRow>
            </TableHeader>
                <TableBody>
                {contributions.map((contribution, idx) => (
                <TableRow key={contribution.month}>
                    <TableCell>{contribution.month}</TableCell>
                    <TableCell>
                    {isEditingEPF ? (
                    <Input
                        type="number"
                        value={contribution.epfContribution}
                        onChange={(e) =>
                            handleInputChange(idx, "epfContribution", e.target.value )
                        }
                    />
                    ) : (
                        contribution.epfContribution
                    )}
                    </TableCell>
                    <TableCell>
                        {isEditingEPF ? (
                            <Input
                                type="number"
                                value={contribution.contributionRemitted}
                                onChange={(e) =>
                                    handleInputChange( idx, "contributionRemitted",  e.target.value)
                                }
                            />
                        ) : (
                            contribution.contributionRemitted
                        )}
                    </TableCell>
                    <TableCell>
                        {isEditingEPF ? (
                            <Input
                                type="number"
                                disabled
                                value={contribution.totalRemitted}
                                onChange={(e) =>
                                    handleInputChange(
                                        idx,
                                        "totalRemitted",
                                        e.target.value
                                    )
                                }
                            />
                        ) : (
                            contribution.totalRemitted
                        )}
                    </TableCell>
                </TableRow>
                ))}
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell>{epfContributionTotal}</TableCell>
                    <TableCell>{contributionRemittedTotal}</TableCell>
                    <TableCell>{totalRemittedTotal}</TableCell>
                </TableRow>
                </TableBody>
            </Table>
            </div>
        </div>
        </div>
    );
};

export default ESICDetails;
