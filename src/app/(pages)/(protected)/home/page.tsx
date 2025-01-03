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
        {/* Startup Statistics Section */}
        <div className="">
          <StartupStats />
        </div>

        {/* Responsive Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 mx-auto">
          <div className="">
            <NoUsers />
          </div>
          <div className="">
            <NoStartups />
          </div>
          <div className="">
            <Domain />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
