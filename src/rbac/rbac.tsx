"use client";
import React, { useEffect, useState } from 'react';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError('Error fetching users');
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registered Users</h1>
      {error && <p className="text-red-500">{error}</p>}
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 bg-white text-left shadow-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border border-gray-300">#</th>
                <th className="px-6 py-3 border border-gray-300">Name</th>
                <th className="px-6 py-3 border border-gray-300">Email</th>
                <th className="px-6 py-3 border border-gray-300">Last Activity</th>
                <th className="px-6 py-3 border border-gray-300">Labels</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.$id}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="px-6 py-4 border border-gray-300">{index + 1}</td>
                  <td className="px-6 py-4 border border-gray-300">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 border border-gray-300">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 border border-gray-300">
                    {user.latestActivity || 'N/A'}
                  </td>
                  <td className="px-6 py-4 border border-gray-300">
                  {user.labels.length > 0 ? user.labels.join(', ') : 'No Labels'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No users found.</p>
      )}
    </div>
  );
};

export default UsersList;
