"use client";

import React, { useEffect, useState } from "react";
import { DATABASE_ID, STARTUP_ID, databases } from "@/appwrite/config";
import { CONTACT_ID } from "@/components/Collections/contacts";
import { Query } from "appwrite";
import { Label } from "@/components/ui/label"; 
import { Input } from "@/components/ui/input"; 
import { Skeleton } from "@/components/ui/skeleton";

type Startup = {
  id: string;
  name: string;
};

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyWebsite: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  companyName: string;
};

interface ContactProps {
  startupId: string;
}

const Contact: React.FC<ContactProps> = ({ startupId }) => {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartupAndContacts = async () => {
      try {
        // Fetch startup details from the Startups table
        const startupResponse = await databases.getDocument(DATABASE_ID, STARTUP_ID, startupId);
        const startupName = startupResponse.name;

        setStartup({
          id: startupResponse.$id,
          name: startupName,
        });

        // Fetch contacts where the startup ID matches
        const contactsResponse = await databases.listDocuments(DATABASE_ID, CONTACT_ID, [
          Query.equal("startup", startupId),
        ]);

        const matchedContacts = contactsResponse.documents
          .filter((doc: any) => doc.startup === startupId)
          .map((doc: any) => ({
            id: doc.$id,
            firstName: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            phone: doc.phone,
            companyWebsite: doc.companyWebsite,
            addressLine1: doc.addressLine1,
            addressLine2: doc.addressLine2,
            city: doc.city,
            state: doc.state,
            companyName: doc.companyName,
          }));

        setContacts(matchedContacts);
      } catch (err) {
        console.error("Error fetching startup or contact details:", err);
        setError("Failed to load details. Please try again.");
      }
    };

    if (startupId) {
      fetchStartupAndContacts();
    }
  }, [startupId]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-bold p-2 -mt-4">Contact</h2>
      <div className="grid grid-cols-2 gap-8">
        
        {/* Combined Box for Website, Email, Primary and Secondary Phone Numbers */}
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div key={contact.id} className="space-y-4 border border-gray-300 p-4 rounded-md shadow-sm">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="website" className="font-semibold text-gray-700">Company Website</Label>
                <Input id="website" value={contact.companyWebsite} readOnly />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                <Input id="email" value={contact.email} readOnly />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="primaryPhone" className="font-semibold text-gray-700">Primary Phone Number</Label>
                <Input id="primaryPhone" value={contact.phone} readOnly />
              </div>
              {/* Secondary phone field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="secondaryPhone" className="font-semibold text-gray-700">Secondary Phone Number</Label>
                <Input id="secondaryPhone" value={"N/A"} readOnly />
              </div>
            </div>
          ))
        ) : (
          /*loading*/
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        )}

        {/* Box for Registered Address */}
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div key={contact.id} className="space-y-4 border border-gray-300 p-4 rounded-md shadow-sm">
              <h3 className="font-bold text-lg">Registered Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="address1" className="font-semibold text-gray-700">Address line 1</Label>
                  <Input id="address1" value={contact.addressLine1} readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="address2" className="font-semibold text-gray-700">Address line 2</Label>
                  <Input id="address2" value={contact.addressLine2} readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="city" className="font-semibold text-gray-700">City</Label>
                  <Input id="city" value={contact.city} readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="state" className="font-semibold text-gray-700">State</Label>
                  <Input id="state" value={contact.state} readOnly />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;