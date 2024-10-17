import React, { useState } from 'react';
import { FaTh, FaRocket, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed ${isOpen ? 'w-14' : 'w-4'} h-screen bg-black flex flex-col items-center py-4 transition-width duration-300`}>
      {/* Toggle Button */}
      <div className="absolute top-20 left-full transform -translate-x-1/2">
        <button 
          onClick={toggleSidebar}
          className="text-white text-lg p-1 bg-gray-800 rounded-full focus:outline-none"
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Icons */}
      {isOpen && (
        <>
          <div className="mb-6 mt-20">
            <a href="/home" className="group">
              <FaTh 
                className="text-white text-2xl transition-transform transform group-hover:scale-125 group-hover:text-gray-300"
              />
            </a>
          </div>
          <div>
            <a href="/startup" className="group">
              <FaRocket 
                className="text-white text-2xl transition-transform transform group-hover:scale-125 group-hover:text-gray-300"
              />
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
