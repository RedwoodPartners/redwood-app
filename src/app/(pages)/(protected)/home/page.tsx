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
import { ServicesChart } from "@/components/charts/services";


const Dashboard = () => {
  return (
    <>
      <Tabs defaultValue="dashboard">
        {/* Tabs List */}
        <TabsList className="grid w-[180px] grid-cols-2 text-black p-2">
          <TabsTrigger value="dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="portfolio">
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="dashboard">
        <StartupStats showInvestmentCard={true} />
          <div className="grid grid-cols-3 gap-4 p-2">
            <ServicesChart />
            <NoUsers />
            <NoStartups />
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
        <StartupStats showInvestmentCard={false} />
        <div className="grid grid-cols-3 gap-4 p-2">
          <LineChartPortfolio />
          <AreaChartPortfolio />
          <Domain />
          {/*<BarChartPortfolio />*/}
        </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Dashboard;
