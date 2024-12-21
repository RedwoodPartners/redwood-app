"use client";

import React, { useEffect, useState } from "react";
import { Client, Databases, Models } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, DATABASE_ID } from "@/appwrite/config";
import { useToast } from "@/hooks/use-toast";
import { CONTACT_ID } from "./view/CompanyInfotabs/Contact";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

type Contact = Models.Document & {
  startupId: string;
  companyWebsite: string;
  email: string;
  phone1: string;
  phone2: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
};

const ContactsTable: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await databases.listDocuments<Contact>(
          DATABASE_ID,
          CONTACT_ID
        );
        setContacts(response.documents);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch contacts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [toast]);

  return (
    <div className="p-2 bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">All Contacts</h2>
      {loading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <Table className="border border-gray-100 rounded-lg">
          <TableCaption>A list of all contacts.</TableCaption>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Startup ID</TableHead>
              <TableHead>Company Website</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone 1</TableHead>
              <TableHead>Phone 2</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.$id}>
                <TableCell>{contact.startupId}</TableCell>
                <TableCell>{contact.companyWebsite}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone1}</TableCell>
                <TableCell>{contact.phone2}</TableCell>
                <TableCell>
                  {`${contact.address1}, ${contact.address2}, ${contact.city}, ${contact.state} - ${contact.postalCode}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ContactsTable;
