"use client";
import React from 'react';
import HomePage from '@/components/Navbar';
import Sidebar from '@/components/menu';

const Home = () => {
  return (
    <div>
      <Sidebar />
      <HomePage />
    </div>
  );
};

export default Home;
