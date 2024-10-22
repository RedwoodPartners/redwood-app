"use client";

import React from "react";

const GstrCompliance: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Form Queries</th>
            <th className="py-2 px-4 border-b">Yes/No</th>
            <th className="py-2 px-4 border-b">Choose Date</th>
            <th className="py-2 px-4 border-b">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b">
              Has the company filed GSTR-1 & GSTR-3B for the current month?
            </td>
            <td className="py-2 px-4 border-b text-center">
              <input type="radio" name="gstr" value="yes" /> Yes
              <input type="radio" name="gstr" value="no" /> No
            </td>
            <td className="py-2 px-4 border-b text-center">
              <input type="date" />
            </td>
            <td className="py-2 px-4 border-b">
              Specify the dates of filing for GSTR-1 and GSTR-3B.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GstrCompliance;
