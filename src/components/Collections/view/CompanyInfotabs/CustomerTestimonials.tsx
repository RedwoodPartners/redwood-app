"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { EditIcon, SaveIcon } from "lucide-react";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";

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

  useEffect(() => {
    const fetchData = async () => {
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
    };

    if (startupId) {
      fetchData();
    }
  }, [startupId]);

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
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <div>
      <div className="flex items-center">
        <h2 className="container text-lg font-bold mb-2 -mt-4 p-2">Customer Testimonials</h2>
        <EditIcon size={25} className="-mt-6 cursor-pointer" onClick={handleEdit} />
        {isEditing && (
          <div onClick={handleSave} className="-mt-6 ml-5 cursor-pointer">
            <SaveIcon size={25} />
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
    { id: "query1", label: "What services/products are using of the company? " },
    { id: "query2", label: "Your View on Service Utilization-will the Service/product be benefical for your company/personal use." },
    { id: "query3", label: "Unique selling proposition of the company- what you switch to using this company's service/product-how were you doing earlier?" },
    { id: "query4", label: "Future of this Segment - in your view, what will be the future of this segement?" },

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
          <AccordionContent className="mt-2 text-gray-700">
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