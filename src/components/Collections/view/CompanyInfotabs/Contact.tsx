"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { CONTACT_ID } from "../../contacts";

interface ContactInfo {
  website: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  phone: string;
  firstName: string;
  lastName: string;
}

interface ContactProps {
  startupId?: string; // Optional prop
}

const Contact: React.FC<ContactProps> = ({ startupId }) => {
  const [contactData, setContactData] = useState<ContactInfo | null>(null);

  // Fetch contact data based on the startupId
  useEffect(() => {
    const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchContactData = async () => {
      if (startupId) {
        try {
          const response = await databases.getDocument(CONTACT_ID, DATABASE_ID, startupId);
          setContactData({
            website: response.companyWebsite || "",
            email: response.email || "",
            address1: response.addressLine1 || "",
            address2: response.addressLine2 || "",
            city: response.city || "",
            state: response.state || "",
            phone: response.phone || "",
            firstName: response.firstName || "",
            lastName: response.lastName || ""
          });
        } catch (error) {
          console.error("Error fetching contact data: ", error);
        }
      }
    };

    fetchContactData();
  }, [startupId]);

  // If no data is found, show loading or error message
  if (!contactData) {
    return <div>Loading contact details...</div>;
  }

  return (
    <div>
      <h2 className="container text-xl font-bold mb-4 -mt-6">Contact</h2>
      <div className="grid grid-cols-2 gap-8">
        {/* Combined Box for Website, Email, Primary and Secondary Phone Numbers */}
        <div className="space-y-4 border border-gray-300 p-4 rounded-md shadow-sm">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="website" className="font-semibold text-gray-700">Company Website</Label>
            <Input id="website" placeholder="Website URL" value={contactData.website} readOnly />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
            <Input id="email" placeholder="Email" value={contactData.email} readOnly />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="primaryPhone" className="font-semibold text-gray-700">Primary Phone Number</Label>
            <Input id="primaryPhone" placeholder="Primary Phone" value={contactData.phone} readOnly />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="secondaryPhone" className="font-semibold text-gray-700">Secondary Phone Number</Label>
            <Input id="secondaryPhone" placeholder="Secondary Phone" readOnly />
          </div>
        </div>

        {/* Box for Registered Address */}
        <div className="space-y-4 border border-gray-300 p-4 rounded-md shadow-sm">
          <h3 className="font-bold text-lg">Registered Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address1" className="font-semibold text-gray-700">Address line 1</Label>
              <Input id="address1" placeholder="Address line 1" value={contactData.address1} readOnly />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address2" className="font-semibold text-gray-700">Address line 2</Label>
              <Input id="address2" placeholder="Address line 2" value={contactData.address2} readOnly />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="city" className="font-semibold text-gray-700">City</Label>
              <Input id="city" placeholder="City" value={contactData.city} readOnly />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="state" className="font-semibold text-gray-700">State</Label>
              <Input id="state" placeholder="State" value={contactData.state} readOnly />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
