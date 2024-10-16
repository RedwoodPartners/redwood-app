"use client";

import React from 'react';
import ProjectsPage from '@/components/Collections/projects';
import Navbar from '@/components/Navbar';
const Startup: React.FC = () => {
  return (
    <div>
      <Navbar />
      <ProjectsPage />
    </div>
  );
}

export default Startup;
