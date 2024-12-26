"use client";

import React from "react";
import { NoUsers } from "@/components/charts/noUsers";
import { NoStartups } from "@/components/charts/noStartups";
import StartupStats from "@/components/charts/startupStats";
import { Domain } from "@/components/charts/domains";

const HomePage = () => {
  return (
    <>
    <div className="bg-gradient-to-b from-blue-50 via-pink-50 to-transparent">
    <StartupStats />
    <div className="flex flex-grow gap-4 p-4">
      <NoUsers />
      <NoStartups />
      <Domain />
    </div>
    </div>
    </>
  ) 
};

export default HomePage;
