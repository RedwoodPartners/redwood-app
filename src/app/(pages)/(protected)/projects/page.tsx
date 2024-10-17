"use client";

import React from 'react';
import ProjectsPage from '@/components/Collections/projects';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/menu';

const Startup: React.FC = () => {
  return (
    <div>
      <Sidebar />
      <Navbar />
      <ProjectsPage />
    </div>
  );
}

export default Startup;
