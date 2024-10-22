"use client";

import React from "react";

const Incubation: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Incubation Program</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b">ABC Incubation Program</td>
            <td className="py-2 px-4 border-b text-center">
              <input type="date" />
            </td>
            <td className="py-2 px-4 border-b text-center">
              <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full">In Progress</span>
            </td>
            <td className="py-2 px-4 border-b">
              Information about the incubation timeline or milestones.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Incubation;
