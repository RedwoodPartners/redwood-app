"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, Databases, Query, Models } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Startup extends Models.Document {
  name: string;
  year: string;
}

export default function StartupsForDomain() {
  const params = useParams();
  const encodedDomain = params?.domain;
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartupsForDomain = async () => {
      if (!encodedDomain || typeof encodedDomain !== "string") {
        console.error("Invalid domain parameter");
        setLoading(false);
        return;
      }

      // Decode the URL-encoded domain
      const domain = decodeURIComponent(encodedDomain);

      setLoading(true);
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        const response = await databases.listDocuments<Startup>(
          DATABASE_ID,
          STARTUP_ID,
          [Query.equal("domain", domain)]
        );
        setStartups(response.documents);
      } catch (error) {
        console.error("Error fetching startups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartupsForDomain();
  }, [encodedDomain]);

  if (!encodedDomain || typeof encodedDomain !== "string") {
    return <div className="container mx-auto py-8">Invalid domain parameter</div>;
  }

  return (
    <div className="container mx-auto py-2 p-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Startups in Domain: {decodeURIComponent(encodedDomain)}</CardTitle>
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
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {startups.map((startup) => (
                  <TableRow key={startup.$id}>
                    <TableCell className="font-medium">{startup.name}</TableCell>
                    <TableCell>{startup.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No startups found for domain  {decodeURIComponent(encodedDomain)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
