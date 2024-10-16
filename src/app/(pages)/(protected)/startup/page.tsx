
"use client";

import React from 'react';
import StartupsPage from '@/components/Collections/startup';
import Navbar from '@/components/Navbar';

const Startup: React.FC = () => {
  return (
    <div className="mt-0">
      <Navbar />
      <StartupsPage />
    </div>
  );
};

export default Startup;
