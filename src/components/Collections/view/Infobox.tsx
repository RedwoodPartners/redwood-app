"use client";

import React from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";

interface InfoBoxProps {
  name: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-between p-2 mx-auto rounded-xl border border-gray-300">
      <div className="flex flex-wrap items-center space-x-4">
        <span className="font-semibold text-gray-700">₹2 Cr</span>
        <span className="font-semibold text-gray-700">20 Jun 2024 - 12 Nov 2024</span>
        <span className="flex items-center space-x-2">
          <span className="bg-red-500 h-2 w-2 rounded-full"></span>
          <span className="text-gray-700">TANSIM</span>
        </span>
        <span className="text-gray-700 border border-gray-300 px-3 rounded-full">Equity</span>
        <span className="text-gray-700 border border-gray-300 px-3 rounded-full">Deep Dive</span>
        <button className="border border-blue-500 text-blue-500 px-3 rounded-full hover:bg-blue-500 hover:text-white transition">
          Pipeline
        </button>
        <button className="text-blue-500 underline hover:text-blue-700 transition">
          Add Profile Info
        </button>
      </div>
      <div className="flex items-center space-x-6 text-black hover:text-gray-700 transition-colors duration-200 ease-in-out">
        <Mail className="icon-class" />
        <MessageCircle className="icon-class" />
        <Globe className="icon-class" />
      </div>
    </div>
  );
};

export default InfoBox;
