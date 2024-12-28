"use client";

import React from "react";
import { NoUsers } from "@/components/charts/noUsers";
import { NoStartups } from "@/components/charts/noStartups";
import StartupStats from "@/components/charts/startupStats";
import { Domain } from "@/components/charts/domains";

const HomePage = () => {
  return (
    <>
    <div className="">
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
