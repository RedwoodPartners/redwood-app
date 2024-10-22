"use client";
import React from "react";

const Compliance: React.FC = () => {
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52">
        <h2 className="text-xl font-bold mb-4">Income Tax Compliances</h2>
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
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex flex-col fixed right-0 h-full -mt-3 w-52 border-l-black border-gray-300 bg-gray-800 text-white">
        <ul className="flex-grow p-5 space-y-4">
          {[
            "ROC Compliance",
            "GST Compliances",
            "Income Tax Compliances",
            "GSTR-1 & GSTR-3B",
            "Audits",
          ].map((link, index) => (
            <li key={index}>
              <a
                href="#"
                className={`block py-2 px-2 w-screen -ml-5 transition-colors ${
                  link === "Income Tax Compliances" ? "bg-white text-black" : "text-white"
                } hover:bg-white hover:text-black`}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Compliance;