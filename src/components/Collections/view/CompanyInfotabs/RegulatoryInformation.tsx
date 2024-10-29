"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type RegulatoryData = {
  dpiitNumber: string;
  cinNumber: string;
  tanNumber: string;
  panNumber: string;
};

const RegulatoryInformation: React.FC = () => {
  const [regulatoryData, setRegulatoryData] = useState<RegulatoryData>({
    dpiitNumber: "",
    cinNumber: "U01100TN2020PTC139521",
    tanNumber: "",
    panNumber: "",
  });

  type RegulatoryKeys = keyof RegulatoryData;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: RegulatoryKeys
  ) => {
    setRegulatoryData({
      ...regulatoryData,
      [field]: e.target.value,
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mt-8 mb-4">Regulatory Information</h2>
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4"> {/* 4 columns */}
          {[
            ["DPIIT Number", "dpiitNumber"],
            ["CIN Number", "cinNumber"],
            ["TAN Number", "tanNumber"],
            ["PAN Number", "panNumber"],
          ].map(([label, field]) => (
            <div key={label} className="flex flex-col">
              <Label className="font-semibold text-gray-700 mb-1">{label}</Label> {/* Using Label component */}
              <Input disabled
                type="text"
                value={regulatoryData[field as RegulatoryKeys]} 
                onChange={(e) => handleInputChange(e, field as RegulatoryKeys)} 
                className="border border-gray-300 rounded px-2 py-1 text-gray-600"
                placeholder="Enter value"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RegulatoryInformation;
