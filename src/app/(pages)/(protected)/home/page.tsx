"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { NoUsers } from "@/components/charts/noUsers";
import { NoStartups } from "@/components/charts/noStartups";
import StartupStats from "@/components/charts/startupStats";
import { Domain } from "@/components/charts/domains";
import { AreaChartPortfolio } from "@/components/charts/areaChart";
import { ServicesChart } from "@/components/charts/services";

const Dashboard = () => {
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  useEffect(() => {
    const alertCount = parseInt(sessionStorage.getItem("dashboardWelcomeAlertCount") || "0", 10);

    if (alertCount < 1) {
      const timer = setTimeout(() => {
        setShowWelcomeAlert(true);
        sessionStorage.setItem("dashboardWelcomeAlertCount", String(alertCount + 1));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <AlertDialog open={showWelcomeAlert} onOpenChange={setShowWelcomeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to the application!</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  To add <b>Projects</b> Navigate to Projects which is on <b>Side bar</b>.
                </li>
                <li>
                  You can view stats, services, and startup information on this dashboard.
                </li>
              </ol>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWelcomeAlert(false)}>
              Got it
            </AlertDialogCancel>
            {/*<AlertDialogAction onClick={() => setShowWelcomeAlert(false)}>
              Close
            </AlertDialogAction>*/}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
