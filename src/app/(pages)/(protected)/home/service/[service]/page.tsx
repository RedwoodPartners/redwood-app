"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Client, Databases, Models } from "appwrite";
import {
  DATABASE_ID,
  PROJECT_ID,
  API_ENDPOINT,
  PROJECTS_ID,
} from "@/appwrite/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProjectDocument = Models.Document & {
  services: string | null;
  name: string;
  startupStatus: string;
};

export default function ServicePage() {
  const [startups, setStartups] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { service } = params as { service: string };

  useEffect(() => {
    const fetchStartups = async () => {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        const response = await databases.listDocuments<ProjectDocument>(
          DATABASE_ID,
          PROJECTS_ID
        );
        const projects = response.documents;

        // Decode the service parameter to handle URL-encoded values
        const decodedService = decodeURIComponent(service);

        // Filter startups that include the selected service
        const filteredStartups = projects.filter((project) => {
          const services = project.services?.split(",") || [];
          return services.map((s) => s.trim()).includes(decodedService);
        });

        setStartups(filteredStartups);
      } catch (error) {
        console.error("Error fetching startups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [service]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto py-2 p-2">
      <Card>
        <CardHeader>
          <CardTitle>Service: {decodeURIComponent(service)}</CardTitle>
        </CardHeader>
        <CardContent>
          {startups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {startups.map((startup) => (
                  <TableRow key={startup.$id}>
                    <TableCell>{startup.name}</TableCell>
                    <TableCell>{startup.startupStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No startups found for this service.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
