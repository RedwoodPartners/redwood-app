"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Client, Account } from "appwrite";
import { PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const client = useMemo(() => {
    const newClient = new Client();
    newClient.setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    return newClient;
  }, []);

  useEffect(() => {
    const account = new Account(client);

    const checkAdminStatus = async () => {
      try {
        const user = await account.get();
        const userLabels = user?.labels || [];
        setIsAdmin(userLabels.includes("admin"));
        setLoading(false);
      } catch (err) {
        setError("Error fetching user data");
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [client]);

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/users");
          const data = await res.json();
          setUsers(data.users);
          setFilteredUsers(data.users);
        } catch (err) {
          setError("Error fetching users");
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter((user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleLabelChange = async (userId: string, newLabel: string) => {
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newLabel }),
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.$id === userId ? { ...user, labels: [newLabel] } : user
        )
      );
    } catch (err) {
      console.error("Error updating label:", err);
      setError("Failed to update label");
    }
  };

  if (loading) return (
    <div className="flex justify-center mt-56">
      <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
        <title id="title">Loading...</title>
        <circle cx="50" cy="50" r="35" stroke="gray" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="55 35">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );

  if (!isAdmin) return (
    <div className="text-red-500 font-medium">
      Access Denied: You must be an admin to view this page.
    </div>
  );

  return (
    <div className="container mx-auto p-3">
      <h1 className="text-xl font-semibold mb-2 text-gray-800">
        Registered Users
      </h1>

      {error && <p className="text-red-500 font-medium mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search by email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-36 p-2 border border-gray-300 rounded"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Role Permissions</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Role Permissions</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold">Admin:</span>
                <span className="col-span-3">Create, Read, Update, Delete</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold">Moderator:</span>
                <span className="col-span-3">Create, Read, Update</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold">Editor:</span>
                <span className="col-span-3">Read, Update</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold">User:</span>
                <span className="col-span-3">Read</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table className="bg-white">
        <TableCaption>A list of registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Labels</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user, index) => (
            <TableRow key={user.$id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{user.name || "N/A"}</TableCell>
              <TableCell>{user.email || "N/A"}</TableCell>
              <TableCell>{user.latestActivity || "N/A"}</TableCell>
              <TableCell>
                <select 
                  value={user.labels[0] || "User"}
                  onChange={(e) => handleLabelChange(user.$id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersList;
