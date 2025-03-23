"use client";

import React from "react";
import { NoUsers } from "@/components/charts/noUsers";
import { NoStartups } from "@/components/charts/noStartups";
import StartupStats from "@/components/charts/startupStats";
import { Domain } from "@/components/charts/domains";

import { LineChartPortfolio } from "@/components/charts/lineChart";
import { AreaChartPortfolio } from "@/components/charts/areaChart";
import { BarChartPortfolio } from "@/components/charts/barChart";
import { ServicesChart } from "@/components/charts/services";
import ProjectStats from "@/components/charts/projectStats";


const Dashboard = () => {
  return (
    <>
        <ProjectStats />
        <StartupStats showInvestmentCard={true} />
          <div className="grid grid-cols-3 gap-4 p-2">
            <ServicesChart />
            <Domain />
            <NoStartups />
            {/*<LineChartPortfolio />*/}
            <AreaChartPortfolio />
            <NoUsers />
          </div>
    </>
  );
};

export default Dashboard;
