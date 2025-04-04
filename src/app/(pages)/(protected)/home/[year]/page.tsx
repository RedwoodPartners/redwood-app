"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Query, Models } from "appwrite";
import { STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Startup extends Models.Document {
  name: string;
  dateOfIncorporation: string;
  domain: string;
  revenue: number;
}

export default function StartupsForYear() {
  const params = useParams();
  const year = typeof params?.year === "string" ? params.year.trim() : null;
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartupsForYear = async () => {
      if (!year) {
        console.error("Invalid year parameter");
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const response = await databases.listDocuments<Startup>(
          STAGING_DATABASE_ID,
          STARTUP_ID,
          [Query.contains("year", year)]
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

  if (!year) {
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
                  <TableHead>Startup record Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {startups.map((startup) => (
                  <TableRow key={startup.$id}>
                    <TableCell className="font-medium">{startup.name}</TableCell>
                    <TableCell>{startup.dateOfIncorporation}</TableCell>
                    <TableCell>{startup.domain}</TableCell>
                    <TableCell>{startup.year}</TableCell>
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
