"use client";
import React from "react";

const CompanyDetails: React.FC = () => {
    return (
      <>
        <h2 className="text-lg font-bold mb-4">Company Details</h2>
        <div className="grid grid-cols-5 gap-4 mt-2">
          {[
            [["Brand Name", "FeNix"], ["Date of Incorporation", "20 Jun 2021"], ["Company Stage", "PoC"]],
            [["Business Type", "Startup"], ["Registered Company Name", "FeNix Tech Pvt Ltd"], ["Registered Country", "India"]],
            [["Nature of the Company", "Technology"], ["Registered State", "Tamil Nadu"], ["Domain", "AI"]],
            [["Sub Domain", "Machine Learning"], ["Incubated?", "Yes"], ["Community Certificate?", "Yes"]],
            [["Patents & Certifications?", "No"], ["Revenue (last FY)", "₹1 Cr"], ["Employees (last FY)", "50"]],
          ].map((columnData, columnIndex) => (
            <div key={columnIndex} className="space-y-2 border-r border-dotted border-gray-300 pr-4">
              {columnData.map(([label, value]) => (
                <div key={label}>
                  <p className="font-semibold text-gray-700 mt-6">{label}</p>
                  <p className="text-gray-600">{value}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  };
  
export default CompanyDetails;
  