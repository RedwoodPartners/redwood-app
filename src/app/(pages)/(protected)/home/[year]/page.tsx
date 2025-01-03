"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Client, Databases, Query, Models } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Startup extends Models.Document {
  name: string;
  description: string;
  foundedDate: string;
  industry: string;
}

export default function StartupsForYear() {
  const params = useParams();
  const year = params?.year;
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartupsForYear = async () => {
      if (!year || typeof year !== 'string') {
        console.error('Invalid year parameter');
        setLoading(false);
        return;
      }

      setLoading(true);
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        const response = await databases.listDocuments<Startup>(
          DATABASE_ID,
          STARTUP_ID,
          [Query.equal('year', year)]
        );
        setStartups(response.documents);
      } catch (error) {
        console.error("Error fetching startups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartupsForYear();
  }, [year]);

  if (!year || typeof year !== 'string') {
    return <div className="container mx-auto py-8">Invalid year parameter</div>;
  }

  return (
    <div className="container mx-auto py-2 p-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Startups in {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : startups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Incorporation</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {startups.map((startup) => (
                  <TableRow key={startup.$id}>
                    <TableCell className="font-medium">{startup.name}</TableCell>
                    <TableCell>{startup.dateOfIncorporation}</TableCell>
                    <TableCell>{startup.domain}</TableCell>
                    <TableCell>₹{startup.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No startups found for {year}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
