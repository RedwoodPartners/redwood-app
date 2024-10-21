"use client";
import React from "react";

const FundingMilestones: React.FC = () => {
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow mr-52">
        <h2 className="text-xl font-bold mb-4">Funding & Milestones</h2>
        <div className="grid grid-cols-3 gap-4 mt-2">
          {[ 
            [["Round Name", "TANSIM"], ["Shareholder Name", "Ravi Senji"], ["Role", "Founder"], ["Capital Structure", "33%"]],
            [["Round Name", "TANSIM"], ["Shareholder Name", "Pandian"], ["Role", "Founder"], ["Capital Structure", "61%"]],
            [["Round Name", "TANSIM"], ["Shareholder Name", "Techin Palakkad"], ["Role", "Institutional Investor"], ["Capital Structure", "6%"]],
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
            "Fund Raised So Far",
            "Shareholders",
            "Cap Table",
            "Fund Ask",
            "Tranches & Milestones",
          ].map((link, index) => (
          <li key={index}>
          <a
          href="#"
          className={`block py-2 w-screen -ml-4 transition-colors ${
            link === "Cap Table" ? "bg-white text-black" : "text-white"
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

export default FundingMilestones;