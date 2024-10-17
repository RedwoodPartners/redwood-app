"use client";
import React from 'react';
import HomePage from '@/components/Navbar';
import Sidebar from '@/components/menu';
import WelcomePage from '@/components/WelcomePage';

const Home = () => {
  return (
    <div>
      <Sidebar />
      <HomePage />
      <WelcomePage />
    </div>
  );
};

export default Home;
