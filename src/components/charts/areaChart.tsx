"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const FUND_RAISED_ID = "6731e2fb000d9580025f";

interface Investment {
  amount: string;
  date: string;
  startupId: string;
}

function isInvestment(doc: any): doc is Investment {
  return (
    typeof doc === "object" &&
    doc !== null &&
    typeof doc.amount === "string" &&
    typeof doc.date === "string" &&
    typeof doc.startupId === "string"
  );
}

export function AreaChartPortfolio() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [uniqueStartupsCount, setUniqueStartupsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const client = useMemo(() => new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID), []);
  const databases = useMemo(() => new Databases(client), [client]);

  const fetchAndPrepareChartData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await databases.listDocuments(DATABASE_ID, FUND_RAISED_ID);
      const documents: any[] = response.documents;

      // Validate and extract investment data
      const investments: Investment[] = documents.filter(isInvestment);

      // Group investments by year
      const yearWiseData: Record<string, { totalAmount: number; startups: Set<string> }> = {};
      investments.forEach((investment) => {
        const year = new Date(investment.date).getFullYear();
        const amount = parseFloat(investment.amount.replace(/[^0-9.-]+/g, ""));
        if (!yearWiseData[year]) {
          yearWiseData[year] = { totalAmount: 0, startups: new Set() };
        }
        yearWiseData[year].totalAmount += isNaN(amount) ? 0 : amount;
        yearWiseData[year].startups.add(investment.startupId);
      });

      // Prepare chart data
      const chartDataArray = Object.keys(yearWiseData)
        .sort()
        .map((year) => ({
          year,
          totalAmount: yearWiseData[year].totalAmount / 1e7, // Convert to crores
          startupsCount: yearWiseData[year].startups.size,
        }));

      // Calculate overall totals
      const totalAmountAllYears = chartDataArray.reduce((sum, data) => sum + data.totalAmount * 1e7, 0); // Convert back to original scale
      const uniqueStartupsAllYears = new Set(
        investments.map((investment) => investment.startupId)
      ).size;

      setChartData(chartDataArray);
      setTotalAmount(totalAmountAllYears);
      setUniqueStartupsCount(uniqueStartupsAllYears);
    } catch (error) {
      console.error("Error fetching investments or preparing chart data:", error);
    } finally {
      setLoading(false);
    }
  }, [databases]);

  useEffect(() => {
    fetchAndPrepareChartData();
  }, [fetchAndPrepareChartData]);

  const chartConfig = {
    totalAmount: {
      label: "Total Amount (in Crores)",
      color: "hsl(var(--chart-1))",
    },
    startupsCount: {
      label: "Number of Startups",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Raised - Year Wise</CardTitle>
        <CardDescription>
          Total investments {totalAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
          <p>Number of Startups Funded: {uniqueStartupsCount}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 15,
                  right: 15,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  tickFormatter={(value) => value.toString()}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="totalAmount"
                  type="natural"
                  fill="var(--color-totalAmount)"
                  fillOpacity={0.4}
                  stroke="var(--color-totalAmount)"
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
