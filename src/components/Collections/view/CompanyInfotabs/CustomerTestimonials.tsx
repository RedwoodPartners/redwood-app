"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { useToast } from "@/hooks/use-toast";

export const CUSTOMER_COLLECTION_ID = "6731d3a0001a04a8f849";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const databases = new Databases(client);

interface CustomerTestimonialsProps {
  startupId: string;
}

const CustomerTestimonials: React.FC<CustomerTestimonialsProps> = ({ startupId }) => {
  const [data, setData] = useState<{ [key: string]: string | null }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMER_COLLECTION_ID,
        [Query.equal("startupId", startupId)]
      );

      if (response.documents.length > 0) {
        setData(response.documents[0]);
        setDocumentId(response.documents[0].$id);
      } else {
        setData({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [startupId]);

  useEffect(() => {
    if (startupId) {
      fetchData();
    }
  }, [startupId, fetchData]); // Added fetchData as a dependency

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const { $id, $databaseId, $collectionId, ...userDefinedData } = data;

      if (documentId) {
        // Update existing document with only user-defined fields
        await databases.updateDocument(DATABASE_ID, CUSTOMER_COLLECTION_ID, documentId, userDefinedData);
      } else {
        // Create a new document for this startup with only user-defined fields
        const response = await databases.createDocument(DATABASE_ID, CUSTOMER_COLLECTION_ID, "unique()", {
          ...userDefinedData,
          startupId: startupId,
        });
        setDocumentId(response.$id);
      }
      setIsEditing(false);
      toast({
        title: "Customer Testimonials saved!",
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleCancel = () => {
    fetchData(); // Re-fetch the data to discard changes
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center">
        <h2 className="container text-lg font-medium mb-2 -mt-4">Customer Testimonials</h2>
        <div className="relative group">
                  <EditIcon
                    size={25}
                    className="-mt-6 cursor-pointer"
                    onClick={handleEdit}
                  />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                    Edit
                  </span>
                </div>
        {isEditing && (
          <div className="flex -mt-6 ml-5">
              <div className="relative group ml-3">
                <SaveIcon size={25} 
                            className="cursor-pointer text-green-500"
                            onClick={() => {
                            handleSave();
                            toast({
                                title: "Customer Testimonials saved!!",
                            })
                          }}
                          />
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                          Save
                          </span>
              </div>
              <div className="relative group ml-3">
                          <XIcon
                            size={25}
                            className="cursor-pointer text-red-500"
                            onClick={handleCancel}
                          />
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                            Cancel
                          </span>
              </div>
            </div>
        )}
      </div>
      <AccordionDemo data={data} isEditing={isEditing} onChange={handleChange} />
    </div>
  );
};

export default CustomerTestimonials;

interface AccordionDemoProps {
  data: { [key: string]: string | null };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

const AccordionDemo: React.FC<AccordionDemoProps> = ({
  data,
  isEditing,
  onChange,
}) => {
  const fields = [
    { id: "query1", label: "What services/products are using of the company?" },
    { id: "query2", label: "Your View on Service Utilization—will the Service/product be beneficial for your company/personal use?" },
    { id: "query3", label: "Unique selling proposition of the company—what made you switch to using this company's service/product—how were you doing earlier?" },
    { id: "query4", label: "Future of this Segment—what do you think will be the future of this segment?" },
  ];

  return (
    <Accordion type="single" collapsible>
      {fields.map((field) => (
        <AccordionItem
          key={field.id}
          value={field.id}
          className="px-3 mb-2 mx-auto bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <AccordionTrigger className="text-sm font-semibold">
            {field.label}
          </AccordionTrigger>
          <AccordionContent className="mt-2 text-black">
            <Textarea
              value={data[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={!isEditing}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
