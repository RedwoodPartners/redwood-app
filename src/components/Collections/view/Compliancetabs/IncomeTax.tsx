"use client";
import React from "react";

const IncomeTaxCompliance: React.FC = () => {
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
              Whether the company filed ITR-6 for AY (Mention the relevant AY)
            </td>
            <td className="py-2 px-4 border-b text-center">
              <input type="radio" name="itr6" value="yes" checked readOnly /> Yes
              <input type="radio" name="itr6" value="no" /> No
            </td>
            <td className="py-2 px-4 border-b text-center">
              <input type="date" />
            </td>
            <td className="py-2 px-4 border-b">
              The company filed the ITR-6 for AY on (Mention the date)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IncomeTaxCompliance;
