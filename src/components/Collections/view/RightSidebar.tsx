"use client";

import React from "react";

interface RightSidebarProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="hidden lg:flex flex-col fixed right-0 h-full mx-auto -mt-3 w-52 border-l-black border-gray-300 bg-gray-800 text-white">
      <ul className="flex-grow p-5 space-y-4 border-t border-black">
        {tabs.map((link, index) => (
          <li key={index}>
            <button
              onClick={() => onTabClick(link)}
              className={`block py-2 px-2 w-screen -ml-5 transition-colors text-left ${
                activeTab === link ? "bg-white text-black" : "text-white"
              } hover:bg-white hover:text-black`}
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RightSidebar;
