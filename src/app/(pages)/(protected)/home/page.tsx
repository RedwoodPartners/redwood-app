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
        <TabsList className="grid w-[250px] grid-cols-3 text-black">
          <TabsTrigger value="dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="portfolio">
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="dashboard">
        <StartupStats showInvestmentCard={true} />
          <div className="grid grid-cols-3 gap-4 p-2">
            <NoUsers />
            <NoStartups />
            <Domain />
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
        <StartupStats showInvestmentCard={false} />
        <div className="grid grid-cols-3 gap-4 p-2">
          <LineChartPortfolio />
          <AreaChartPortfolio />
          <BarChartPortfolio />
        </div>
        </TabsContent>
        
        <TabsContent value="projects">
        <StartupStats showInvestmentCard={false} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Dashboard;
