"use client";

import { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import { Client, Databases, Query } from "appwrite";
import { API_ENDPOINT, PROJECT_ID, STAGING_DATABASE_ID } from "@/appwrite/config";
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

import { Input } from "@/components/ui/input";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);
interface Contact extends Models.Document {
  startupId: string;
  companyWebsite: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  registeredAddress1: string;
  registeredAddress2: string;
  registeredCity: string;
  state: string;
  postalCode: string;
  communicationAddress1: string;
  communicationAddress2: string;
  communicationCity: string;
  communicationState: string;
  postalCode2: string;
}

const ContactsTable: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await databases.listDocuments<Contact>(
          STAGING_DATABASE_ID,
          CONTACT_ID
        );
        setContacts(response.documents);
        setFilteredContacts(response.documents);
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

  useEffect(() => {
    const filtered = contacts.filter((contact) =>
      contact.startupId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="p-2 rounded-lg">
      <h2 className="text-xl font-bold mb-4">All Contacts</h2>
      <Input
        type="text"
        placeholder="Search by Startup ID"
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 w-44"
      />
      {loading ? (
        <div className="flex justify-center mt-56">
          <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
            <title id="title">Loading...</title>
            <circle cx="50" cy="50" r="35" stroke="gray" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="55 35">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      ) : filteredContacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg border border-gray-300">
          <Table className="border border-gray-100 rounded-lg">
            <TableCaption>A list of all contacts.</TableCaption>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Startup ID</TableHead>
                <TableHead>Company Website</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone 1</TableHead>
                <TableHead>Phone 2</TableHead>
                <TableHead>Registered Address</TableHead>
                <TableHead>Communication Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.$id}>
                  <TableCell>{contact.startupId}</TableCell>
                  <TableCell>
                    <a
                      href={contact.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {contact.companyWebsite}
                    </a>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.primaryPhone}</TableCell>
                  <TableCell>{contact.secondaryPhone}</TableCell>
                  <TableCell>
                    <p>{contact.registeredAddress1}</p>
                    <p>{contact.registeredAddress2}</p>
                    <p>{`${contact.registeredCity}, ${contact.state} - ${contact.postalCode}`}</p>
                  </TableCell>
                  <TableCell>
                    <p>{contact.communicationAddress1}</p>
                    <p>{contact.communicationAddress2}</p>
                    <p>{`${contact.communicationCity}, ${contact.communicationState} - ${contact.postalCode2}`}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ContactsTable;
