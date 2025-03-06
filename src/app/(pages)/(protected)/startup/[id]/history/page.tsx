"use client";

import React, { useEffect, useState } from "react";
import { databases } from "@/lib/utils";
import { STAGING_DATABASE_ID } from "@/appwrite/config";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Query } from "appwrite";
import { HISTORY_COLLECTON_ID } from "@/components/Collections/view/CompanyInfotabs/CompanyDetails";
import LoadingSpinner from "@/components/ui/loading";

interface HistoryRecord {
  $id: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
}

const StartupHistoryPage = ({ params }: { params: { id: string } }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await databases.listDocuments(
          STAGING_DATABASE_ID,
          HISTORY_COLLECTON_ID,
          [
            Query.equal("startupId", params.id),
            Query.orderDesc("changedAt"),
          ]
        );

        // Map response documents to match HistoryRecord structure
        const mappedHistory = response.documents.map((doc) => ({
          $id: doc.$id,
          fieldChanged: doc.fieldChanged,
          oldValue: doc.oldValue,
          newValue: doc.newValue,
          changedAt: doc.changedAt,
        }));

        setHistory(mappedHistory);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [params.id]);

  if (loading) return <div><LoadingSpinner /></div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Startup History</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
            <TableHead>Changed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record.$id}>
              <TableCell>{record.fieldChanged}</TableCell>
              <TableCell>{record.oldValue || "N/A"}</TableCell>
              <TableCell>{record.newValue || "N/A"}</TableCell>
              <TableCell>{new Date(record.changedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StartupHistoryPage;
