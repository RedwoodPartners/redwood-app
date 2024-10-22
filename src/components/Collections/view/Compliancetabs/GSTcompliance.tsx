"use client";

import React from "react";

const GstCompliance: React.FC = () => {
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
              Has the company filed GST returns for the current month?
            </td>
            <td className="py-2 px-4 border-b text-center">
              <input type="radio" name="gst" value="yes" /> Yes
              <input type="radio" name="gst" value="no" /> No
            </td>
            <td className="py-2 px-4 border-b text-center">
              <input type="date" />
            </td>
            <td className="py-2 px-4 border-b">
              Specify the date of GST return filing.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GstCompliance;
