"use client";

import React from "react";
import { NoUsers } from "@/components/charts/noUsers";
import { NoStartups } from "@/components/charts/noStartups";
import StartupStats from "@/components/charts/startupStats";
import { Domain } from "@/components/charts/domains";

const HomePage = () => {
  return (
    <>
    <StartupStats />
    <div className="flex flex-wrap gap-4 p-5 ">
      <NoUsers />
      <NoStartups />
      <Domain />
    </div>
    </>
  ) 
};

export default HomePage;
