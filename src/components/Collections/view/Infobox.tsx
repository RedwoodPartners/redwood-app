"use client";

import React from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";

interface InfoBoxProps {
  name: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ name }) => {
  return (
    <div className="flex flex-wrap items-center justify-between p-2 mx-auto rounded-xl border border-gray-300 bg-white space-y-4 sm:space-y-0">
      {/* Left Section */}
      <div className="flex flex-wrap items-center space-x-4 space-y-2 sm:space-y-0">
        <span className="font-semibold text-gray-700 text-sm sm:text-base">
          ₹2 Cr
        </span>
        <span className="font-semibold text-gray-700 text-sm sm:text-base">
          20 Jun 2024 - 12 Nov 2024
        </span>
        <span className="flex items-center space-x-2">
          <span className="bg-red-500 h-2 w-2 rounded-full"></span>
          <span className="text-gray-700 text-sm sm:text-base">TANSIM</span>
        </span>
        <span className="text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          Equity
        </span>
        <span className="text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm">
          Deep Dive
        </span>
        <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition">
          Pipeline
        </button>
        <button className="text-blue-500 underline text-xs sm:text-sm hover:text-blue-700 transition">
          Add Profile Info
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 sm:space-x-6 text-black hover:text-gray-700 transition-colors duration-200 ease-in-out">
        <Mail className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
        <MessageCircle className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
        <Globe className="icon-class h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
};

export default InfoBox;
