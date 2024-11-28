"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Client, Account } from "appwrite";
import { PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Use useMemo to memoize the client object
  const client = useMemo(() => {
    const newClient = new Client();
    newClient.setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
    return newClient;
  }, []); // Empty dependency array means this runs once

  useEffect(() => {
    const account = new Account(client);

    const checkAdminStatus = async () => {
      try {
        // Get the current user
        const user = await account.get();
        const userLabels = user?.labels || [];

        // Check if the user has the "admin" label
        if (userLabels.includes("admin")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      } catch (err) {
        setError("Error fetching user data");
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [client]); // Add 'client' as a dependency

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/users");
          const data = await res.json();
          setUsers(data.users);
        } catch (err) {
          setError("Error fetching users");
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  if (loading) {
    return <div>
        <div className="flex justify-center mt-56">
          <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
          <title id="title">Loading...</title>
          <circle cx="50" cy="50" r="35" stroke="gray" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="55 35">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
          </circle>
          </svg>
        </div>
    </div>;
  }

  if (!isAdmin) {
    return <div className="text-red-500 font-medium">Access Denied: You must be an admin to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-3">
      <h1 className="text-xl font-semibold mb-2 text-gray-800">Registered Users</h1>

      {/* Error Message */}
      {error && <p className="text-red-500 font-medium mb-4">{error}</p>}

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">#</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Last Activity</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Labels</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.$id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.latestActivity || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.labels?.length > 0 ? user.labels.join(", ") : "User"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Role Permissions Section */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-black rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center border-b border-white pb-2">Role Permissions</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="font-semibold text-base w-24">Admin:</span>
                <span className="ml-4">Create, Read, Update, Delete</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-base w-24">Moderator:</span>
                <span className="ml-4">Create, Read, Update</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-base w-24">Editor:</span>
                <span className="ml-4">Read, Update</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-base w-24">User:</span>
                <span className="ml-4">Read</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /*Loading*/
        <div className="flex justify-center mt-56">
          <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
          <title id="title">Loading...</title>
          <circle cx="50" cy="50" r="35" stroke="gray" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="55 35">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
          </circle>
          </svg>
        </div>
      )}
    </div>
  );
};

export default UsersList;