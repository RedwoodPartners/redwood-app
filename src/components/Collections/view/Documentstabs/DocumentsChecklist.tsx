"use client";

import React from "react";

const DocumentChecklist: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Document Name</th>
            <th className="py-2 px-4 border-b">Document Type</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b">Bank Statements</td>
            <td className="py-2 px-4 border-b text-center">
              <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full">Financial</span>
            </td>
            <td className="py-2 px-4 border-b text-center">
              <span className="bg-orange-100 text-orange-800 py-1 px-3 rounded-full">Pending</span>
            </td>
            <td className="py-2 px-4 border-b">
              Mention any important information or deadline for submission.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DocumentChecklist;
