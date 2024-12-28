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

import { Input } from "@/components/ui/input";

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

type GroupedContact = {
  startupId: string;
  companyWebsite: string;
  email: string;
  phone1: string;
  phone2: string;
  addresses: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
  }[];
};

const ContactsTable: React.FC = () => {
  const [groupedContacts, setGroupedContacts] = useState<GroupedContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<GroupedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await databases.listDocuments<Contact>(
          DATABASE_ID,
          CONTACT_ID
        );
        const contacts = response.documents;

        // Group contacts by startupId
        const groupedContactsMap = contacts.reduce((acc, contact) => {
          if (!acc[contact.startupId]) {
            acc[contact.startupId] = {
              startupId: contact.startupId,
              companyWebsite: contact.companyWebsite,
              email: contact.email,
              phone1: contact.phone1,
              phone2: contact.phone2,
              addresses: [],
            };
          }
          acc[contact.startupId].addresses.push({
            address1: contact.address1,
            address2: contact.address2,
            city: contact.city,
            state: contact.state,
            postalCode: contact.postalCode,
          });
          return acc;
        }, {} as Record<string, GroupedContact>);

        const groupedContactsArray = Object.values(groupedContactsMap);
        setGroupedContacts(groupedContactsArray);
        setFilteredContacts(groupedContactsArray);
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
    const filtered = groupedContacts.filter((contact) =>
      contact.startupId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchTerm, groupedContacts]);

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
        <>
        <div className="flex justify-center mt-56">
          <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
          <title id="title">Loading...</title>
          <circle cx="50" cy="50" r="35" stroke="gray" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="55 35">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
          </circle>
          </svg>
        </div>
        </>
      ) : filteredContacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <Table className="border border-gray-100 rounded-lg bg-white">
          <TableCaption>A list of all contacts grouped by Startup ID.</TableCaption>
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
              <TableRow key={contact.startupId}>
                <TableCell>{contact.startupId}</TableCell>
                <TableCell>{contact.companyWebsite}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone1}</TableCell>
                <TableCell>{contact.phone2}</TableCell>
                <TableCell>
                  {contact.addresses[0] && (
                    <>
                      <p>{contact.addresses[0].address1}</p>
                      <p>{contact.addresses[0].address2}</p>
                      <p>{`${contact.addresses[0].city}, ${contact.addresses[0].state} - ${contact.addresses[0].postalCode}`}</p>
                    </>
                  )}
                </TableCell>
                <TableCell>
                  {contact.addresses[1] && (
                    <>
                      <p>{contact.addresses[1].address1}</p>
                      <p>{contact.addresses[1].address2}</p>
                      <p>{`${contact.addresses[1].city}, ${contact.addresses[1].state} - ${contact.addresses[1].postalCode}`}</p>
                    </>
                  )}
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
