"use  client";

import React from "react";

const CapTable: React.FC = () => {
  const capTableData = [
    [
      ["Round Name", "TANSIM"],
      ["Shareholder Name", "Ravi Senji"],
      ["Role", "Founder"],
      ["Capital Structure", "33%"],
    ],
    [
      ["Round Name", "TANSIM"],
      ["Shareholder Name", "Pandian"],
      ["Role", "Founder"],
      ["Capital Structure", "61%"],
    ],
    [
      ["Round Name", "TANSIM"],
      ["Shareholder Name", "Techin Palakkad"],
      ["Role", "Institutional Investor"],
      ["Capital Structure", "6%"],
    ],
  ];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Cap Table</h3>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {capTableData.map((columnData, columnIndex) => (
          <div
            key={columnIndex}
            className="space-y-2 border-r border-dotted border-gray-300 pr-4"
          >
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
  );
};

export default CapTable;
