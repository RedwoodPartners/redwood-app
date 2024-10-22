"use client";


import React from "react";

const Patents: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Patent Name</th>
            <th className="py-2 px-4 border-b">Filed Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b">XYZ Technology Patent</td>
            <td className="py-2 px-4 border-b text-center">
              <input type="date" />
            </td>
            <td className="py-2 px-4 border-b text-center">
              <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full">Approved</span>
            </td>
            <td className="py-2 px-4 border-b">
              Details about the patent approval process or required actions.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Patents;
