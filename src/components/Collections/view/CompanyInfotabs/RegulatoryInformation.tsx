"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { API_ENDPOINT, PROJECT_ID, STAGING_DATABASE_ID } from "@/appwrite/config";
import { databases, useIsStartupRoute } from "@/lib/utils";
import { Query } from "appwrite";
import { EditIcon, SaveIcon, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { FaEye } from "react-icons/fa";

type RegulatoryData = {
  dpiitNumber: string;
  cinNumber: string;
  tanNumber: string;
  panNumber: string;
  gstNumber: string;
  udyamRegNumber: string;
  profRegNumber: string;
  shopsActRegNumber: string;
};

type ErrorData = {
  [K in keyof RegulatoryData]: string;
};

export const REGULATORY_COLLECTION_ID = "6731872d0023e52aebc3";
export const REGULATORY_HISTORY_COLLECTION_ID = "67cb2f3b002e2a70248d";

const DOC_CHECKLIST_ID = "673c200b000a415bbbad";
const BUCKET_ID = "66eb0cfc000e821db4d9";

interface RegulatoryInformationProps {
  startupId: string;
  setIsDirty: (isDirty: boolean) => void;
}

const RegulatoryInformation: React.FC<RegulatoryInformationProps> = ({ startupId, setIsDirty }) => {
  const [regulatoryData, setRegulatoryData] = useState<RegulatoryData>({
    dpiitNumber: "",
    cinNumber: "",
    tanNumber: "",
    panNumber: "",
    gstNumber: "",
    udyamRegNumber: "",
    profRegNumber: "",
    shopsActRegNumber: "",
  });
  const [errors, setErrors] = useState<ErrorData>({
    dpiitNumber: "",
    cinNumber: "",
    tanNumber: "",
    panNumber: "",
    gstNumber: "",
    udyamRegNumber: "",
    profRegNumber: "",
    shopsActRegNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [previousData, setPreviousData] = useState<RegulatoryData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const isStartupRoute = useIsStartupRoute();
  const [coiFileId, setCoiFileId] = useState<string | null>(null);
  const [dpiitFileId, setDpiitFileId] = useState<string | null>(null);
  const [gstFileId, setGstFileId] = useState<string | null>(null);
  const [udyamFileId, setUdyamFileId] = useState<string | null>(null);
  const [profTaxFileId, setProfTaxFileId] = useState<string | null>(null);
  const [shopsActFileId, setShopsActFileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          REGULATORY_COLLECTION_ID,
          [Query.equal("startupId", startupId)]
        );
        if (response.documents.length > 0) {
          const document = response.documents[0];
          setRegulatoryData({
            dpiitNumber: document.dpiitNumber || "",
            cinNumber: document.cinNumber || "",
            tanNumber: document.tanNumber || "",
            panNumber: document.panNumber || "",
            gstNumber: document.gstNumber || "",
            udyamRegNumber: document.udyamRegNumber || "",
            profRegNumber: document.profRegNumber || "",
            shopsActRegNumber: document.shopsActRegNumber || "",
          });
          setPreviousData({
            dpiitNumber: document.dpiitNumber || "",
            cinNumber: document.cinNumber || "",
            tanNumber: document.tanNumber || "",
            panNumber: document.panNumber || "",
            gstNumber: document.gstNumber || "",
            udyamRegNumber: document.udyamRegNumber || "",
            profRegNumber: document.profRegNumber || "",
            shopsActRegNumber: document.shopsActRegNumber || "",
          });
          setDocumentId(document.$id);
        } else {
          setRegulatoryData({
            dpiitNumber: "",
            cinNumber: "",
            tanNumber: "",
            panNumber: "",
            gstNumber: "",
            udyamRegNumber: "",
            profRegNumber: "",
            shopsActRegNumber: "",
          });
        }
      } catch (error) {
        console.error("Error fetching regulatory data:", error);
      }
    };
  
    if (startupId) {
      fetchData();
    }
  }, [startupId]);

  // Fetch Certificate of Incorporation fileId
  useEffect(() => {
    const fetchCOI = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Certificate of Incorporation"),
          ]
        );
        if (response.documents.length > 0) {
          const doc = response.documents[0];
          setCoiFileId(doc.fileId || null);
        } else {
          setCoiFileId(null);
        }
      } catch (error) {
        setCoiFileId(null);
      }
    };
    if (startupId) fetchCOI();
  }, [startupId]);

  // Fetch DPIIT fileId
  useEffect(() => {
    const fetchDPIIT = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Startup India (DPIIT) Certificate"),
          ]
        );
        if (response.documents.length > 0) {
          setDpiitFileId(response.documents[0].fileId || null);
        } else {
          setDpiitFileId(null);
        }
      } catch {
        setDpiitFileId(null);
      }
    };
    if (startupId) fetchDPIIT();
  }, [startupId]);

  // GST Certificate
  useEffect(() => {
    const fetchGST = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Copy of GST Registration Certificate & PAN Card"),
          ]
        );
        setGstFileId(response.documents[0]?.fileId || null);
      } catch {
        setGstFileId(null);
      }
    };
    if (startupId) fetchGST();
  }, [startupId]);

  // Udyam Certificate
  useEffect(() => {
    const fetchUdyam = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Udyam Registration Certificate"),
          ]
        );
        setUdyamFileId(response.documents[0]?.fileId || null);
      } catch {
        setUdyamFileId(null);
      }
    };
    if (startupId) fetchUdyam();
  }, [startupId]);

  // Professional Tax
  useEffect(() => {
    const fetchProfTax = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Details of Professional Tax registration if the company is registered"),
          ]
        );
        setProfTaxFileId(response.documents[0]?.fileId || null);
      } catch {
        setProfTaxFileId(null);
      }
    };
    if (startupId) fetchProfTax();
  }, [startupId]);

  // Shops Act
  useEffect(() => {
    const fetchShopsAct = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          DOC_CHECKLIST_ID,
          [
            Query.equal("startupId", startupId),
            Query.equal("docName", "Details of the Shops and Establishment Act, 1948 registration if the company is registered."),
          ]
        );
        setShopsActFileId(response.documents[0]?.fileId || null);
      } catch {
        setShopsActFileId(null);
      }
    };
    if (startupId) fetchShopsAct();
  }, [startupId]);

  const fileIdMap = {
    dpiitNumber: dpiitFileId,
    gstNumber: gstFileId,
    udyamRegNumber: udyamFileId,
    profRegNumber: profTaxFileId,
    shopsActRegNumber: shopsActFileId,
  };

  const titleMap = {
    dpiitNumber: "View DPIIT Certificate",
    gstNumber: "View GST & PAN Certificate",
    udyamRegNumber: "View Udyam Registration",
    profRegNumber: "View Professional Tax Registration",
    shopsActRegNumber: "View Shops Act Registration",
  };
  type FileIdField = keyof typeof fileIdMap;
  

  const validateInput = (value: string, format: string): boolean => {
    if (value === "") return true; // Allowing empty fields to save
    if (value.length !== format.length) return false;
    for (let i = 0; i < format.length; i++) {
      if (format[i] === 'A' && !/[A-Z]/.test(value[i])) return false;
      if (format[i] === '-' && !/[-]/.test(value[i])) return false;
      if (format[i] === '0' && !/[0-9]/.test(value[i])) return false;
    }
    return true;
  };

  const handleInputChange = (
    
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof RegulatoryData
  ) => {
    setIsDirty(true);
    const formats = {
      dpiitNumber: "AAAA000000000",
      cinNumber: "A-00000-AA-0000-AAA-000000",
      tanNumber: "AAAA-00000-A",
      panNumber: "AAAAA-0000-A",
      gstNumber: "00-AAAAA-0000-A-0-AA",
      udyamRegNumber: "UDYAM-TN-00-0000000",
      profRegNumber: "00-000-AA-00000",
      shopsActRegNumber: "TN-AAAAAA-AAAA-00-00-00000",
    };
  
    const format = formats[field];
    const input = e.target.value.toUpperCase();
    const prevValue = regulatoryData[field];
  
    // Check if the user is deleting
    const isDeleting = input.length < prevValue.length;
    // Remove dashes from input for processing
    const rawValue = input.replace(/-/g, "");
    let formattedValue = "";
    let rawIndex = 0;
  
    for (let i = 0; i < format.length; i++) {
      if (rawIndex >= rawValue.length) break;
  
      if (format[i] === "-") {
        formattedValue += "-";
      } else {
        formattedValue += rawValue[rawIndex];
        rawIndex++;
      }
    }
    // Handle edge case: deleting near a dash
    if (isDeleting && prevValue.endsWith("-") && !formattedValue.endsWith("-")) {
      formattedValue = formattedValue.slice(0, -1);
    }
  
    setRegulatoryData({
      ...regulatoryData,
      [field]: formattedValue,
    });
    
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };
  
  

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({
      dpiitNumber: "",
      cinNumber: "",
      tanNumber: "",
      panNumber: "",
      gstNumber: "",
      udyamRegNumber: "",
      profRegNumber: "",
      shopsActRegNumber: "",
    });
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsDirty(false);
    const formats = {
      dpiitNumber: 'AAAA000000000',
      cinNumber: 'A-00000-AA-0000-AAA-000000',
      tanNumber: 'AAAA-00000-A',
      panNumber: 'AAAAA-0000-A',
      gstNumber: '00-AAAAA-0000-A-0-AA',
      udyamRegNumber: 'UDYAM-TN-00-0000000',
      profRegNumber: '00-000-AA-00000',
      shopsActRegNumber: 'TN-AAAAAA-AAAA-00-00-00000',
    };

    const newErrors: ErrorData = {
      dpiitNumber: "",
      cinNumber: "",
      tanNumber: "",
      panNumber: "",
      gstNumber: "",
      udyamRegNumber: "",
      profRegNumber: "",
      shopsActRegNumber: "",
    };

    let hasErrors = false;

    Object.entries(regulatoryData).forEach(([field, value]) => {
      if (value !== "") { // Only validate non-empty fields
        const format = formats[field as keyof RegulatoryData];
        if (field !== "dpiitNumber" && !validateInput(value, format)) {
          newErrors[field as keyof ErrorData] = `Please enter a valid ${field.replace('Number', '')} number`;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      toast({
        title: "Please correct the errors before saving",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { dpiitNumber, cinNumber, tanNumber, panNumber, gstNumber, udyamRegNumber, profRegNumber, shopsActRegNumber, } = regulatoryData;
      if (documentId) {
        await databases.updateDocument(
          STAGING_DATABASE_ID,
          REGULATORY_COLLECTION_ID,
          documentId,
          {
            dpiitNumber,
            cinNumber,
            tanNumber,
            panNumber,
            gstNumber,
            udyamRegNumber,
            profRegNumber,
            shopsActRegNumber,
          }
        );
      } else {
        const response = await databases.createDocument(
          STAGING_DATABASE_ID,
          REGULATORY_COLLECTION_ID,
          "unique()",
          {
            dpiitNumber,
            cinNumber,
            tanNumber,
            panNumber,
            gstNumber,
            udyamRegNumber,
            profRegNumber,
            shopsActRegNumber,
            startupId: startupId,
          }
        );
        setDocumentId(response.$id);
      }
      // Save changes to the Regulatory History collection
      const changes: { startupId: string; fieldChanged: string; oldValue: string; newValue: string; changedAt: string }[] = [];

      Object.keys(regulatoryData).forEach((key) => {
        if (regulatoryData[key as keyof RegulatoryData] !== previousData?.[key as keyof RegulatoryData]) {
          let oldValue = previousData?.[key as keyof RegulatoryData] || "N/A";
          let newValue = regulatoryData[key as keyof RegulatoryData];
      
          changes.push({
            startupId,
            fieldChanged: key,
            oldValue,
            newValue,
            changedAt: new Date().toISOString(),
          });
        }
      });
      
      await Promise.all(
        changes.map((change) =>
          databases.createDocument(STAGING_DATABASE_ID, REGULATORY_HISTORY_COLLECTION_ID, "unique()", change)
        )
      );
      setIsEditing(false);
      toast({
        title: "Regulatory Information saved!",
      });
    } catch (error) {
      console.error("Error saving regulatory data:", error);
      toast({
        title: "Error saving Regulatory Information",
        variant: "destructive",
      });
    }  finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">Regulatory Information</h2>
          <div className="ml-3">
          {isStartupRoute && (
            <Link href={`/startup/${startupId}/RegulatoryHistory`}>
            <span className="text-blue-500 hover:text-blue-700 text-sm">
              Audit Trails
            </span>
          </Link>
          )}
          </div>
        </div>
        
        <div className="flex items-center">
          {isEditing ? (
            <div  
              onClick={handleSave}
              className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1"
            >
              <SaveIcon
                size={15}
                className="cursor-pointer text-green-500"
              />
              <span className="text-xs">
                {isSubmitting ? "Saving..." : "Save"}
              </span>
            </div>
          ) : (
            <div
              onClick={handleEdit}
              className="cursor-pointer border border-gray-300 rounded-full p-1 flex items-center space-x-1 mb-1"
            >
              <EditIcon size={15} />
              <span className="text-xs">Edit</span>
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="grid grid-cols-4 gap-4">
          {[
            ["DPIIT Number", "dpiitNumber", "AAAAA00000000000"],
            ["CIN Number", "cinNumber", "A-00000-AA-0000-AAA-000000"],
            ["TAN Number", "tanNumber", "AAAA-00000-A"],
            ["PAN Number", "panNumber", "AAAAA-0000-A"],
            ["GST Number", "gstNumber", "00-AAAAA-0000-A-0-AA"],
            ["UDYAM Registration Number", "udyamRegNumber", "UDYAM-TN-00-0000000"],
            ["Professional Tax Registration","profRegNumber", "00-000-AA-00000"],
            ["Shops and Establishment Act Registration", "shopsActRegNumber", "TN-AAAAAA-AAAA-00-00-00000"]
          ].map(([label, field, format]) => (
            <div key={label} className="flex flex-col">
              <div className="flex items-center mb-1">
                <Label className="font-semibold text-gray-700">{label}</Label>
                {["cinNumber", "panNumber", "tanNumber"].includes(field) && (
                  coiFileId ? (
                    <a
                      href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${coiFileId}/view?project=${PROJECT_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1"
                      title="View Certificate of Incorporation"
                    >
                      <FaEye className="ml-2 text-blue-500 hover:text-blue-700" size={20} />
                    </a>
                  ) : (
                    <FaEye className="ml-2 text-gray-400" size={20} title="Certificate of Incorporation not uploaded" />
                  )
                )}
                {(["dpiitNumber", "gstNumber", "udyamRegNumber", "profRegNumber", "shopsActRegNumber"] as FileIdField[]).includes(field as FileIdField) && (
                  (() => {
                    const fileId = fileIdMap[field as FileIdField];
                    const title = titleMap[field as FileIdField];
                    return fileId ? (
                      <a
                        href={`${API_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1"
                        title={title}
                      >
                        <FaEye className="ml-2 text-blue-500 hover:text-blue-700" size={20} />
                      </a>
                    ) : (
                      <FaEye className="ml-2 text-gray-400" size={20} title={`${title} not uploaded`} />
                    );
                  })()
                )}
                <div className="relative ml-2">
                  <span className={`absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 ${
                    focusedField === field ? 'block' : 'hidden'
                  } bg-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap z-10`}>
                    Format: {format}
                  </span>
                </div>
              </div>
              <Input
                type="text"
                value={regulatoryData[field as keyof RegulatoryData]}
                onChange={(e) => handleInputChange(e, field as keyof RegulatoryData)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                disabled={!isEditing}
                className={`border rounded px-2 py-1 text-black ${
                  errors[field as keyof ErrorData] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={format as string}
                maxLength={(format as string).length}
              />
              {errors[field as keyof ErrorData] && (
                <span className="text-red-500 text-xs mt-1">{errors[field as keyof ErrorData]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RegulatoryInformation;
