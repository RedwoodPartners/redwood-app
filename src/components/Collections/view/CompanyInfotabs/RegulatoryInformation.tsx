"use client";

import React from "react";


const RegulatoryInformation: React.FC = () => {
    return (
      <>
        <h2 className="text-xl font-bold mt-8 mb-4">Regulatory Information</h2>
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              ["DPIIT Number", "Value"],
              ["CIN Number", "U01100TN2020PTC139521"],
              ["TAN Number", "Value"],
              ["PAN Number", "Value"],
            ].map(([label, value]) => (
              <div key={label} className="space-y-1">
                <p className="font-semibold text-gray-700">{label}</p>
                <p className="text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  
export default RegulatoryInformation;
  