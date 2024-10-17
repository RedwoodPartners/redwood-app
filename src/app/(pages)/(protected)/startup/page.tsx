
"use client";

import React from 'react';
import StartupsPage from '@/components/Collections/startup';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/menu';

const Startup: React.FC = () => {
  return (
    <div>
      <Sidebar />
      <Navbar />
      <StartupsPage />
    </div>
  );
};

export default Startup;
