"use client";
import React from "react";

const CompanyInformation: React.FC = () => {
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52"> {/* Add margin-right equal to sidebar width */}
        <h2 className="text-xl font-bold mb-4">Company Details</h2>
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
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex flex-col fixed right-0 h-full -mt-3 w-52 border-l-black border-gray-300 bg-gray-800 text-white">
        <ul className="flex-grow p-5 space-y-4">
          {[
            "Company Details",
            "Regulatory Information",
            "Contact",
            "About Business",
            "Customer Testimonials",
          ].map((link, index) => (
          <li key={index}>
          <a
          href="#"
          className={`block py-2 w-screen -ml-4 transition-colors ${
            link === "Company Details" ? "bg-white text-black" : "text-white"
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

export default CompanyInformation;
