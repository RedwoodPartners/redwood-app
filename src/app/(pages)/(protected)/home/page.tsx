"use client";

import React from "react";
import { NoUsers } from "@/components/charts/noUsers";
import { NoStartups } from "@/components/charts/noStartups";
import StartupStats from "@/components/charts/startupStats";
import { Domain } from "@/components/charts/domains";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LineChartPortfolio } from "@/components/charts/lineChart";
import { AreaChartPortfolio } from "@/components/charts/areaChart";
import { BarChartPortfolio } from "@/components/charts/barChart";


const Dashboard = () => {
  return (
    <>
      <Tabs defaultValue="dashboard" className="">
        {/* Tabs List */}
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="dashboard" className="">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="">
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="dashboard">
          {/* Startup Statistics Section */}
          <div>
            <StartupStats />
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 mx-auto">
            <div>
              <NoUsers />
            </div>
            <div>
              <NoStartups />
            </div>
            <div>
              <Domain />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
        <StartupStats />
        <div className="grid grid-cols-3 gap-4 p-2">
          <LineChartPortfolio />
          <AreaChartPortfolio />
          <BarChartPortfolio />
        </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Dashboard;
