"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Client, Databases } from "appwrite";
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";

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

const chartConfig = {
  desktop: {
    label: "Startups",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function NoStartups() {
  const [chartData, setChartData] = useState<{ year: string; Startups: number }[]>([]);

  useEffect(() => {
    const fetchStartups = async () => {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
      const databases = new Databases(client);

      try {
        const response = await databases.listDocuments(DATABASE_ID, STARTUP_ID);
        const startups = response.documents;

        const startupsByYear: { [key: string]: number } = startups.reduce((acc, startup) => {
          const year = startup.year || "Unknown";
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const formattedData = Object.entries(startupsByYear)
          .map(([year, count]) => ({ year, Startups: count }))
          .sort((a, b) => a.year.localeCompare(b.year));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching startups:", error);
      }
    };

    fetchStartups();
  }, []);

  return (
    <Card className="flex flex-col shadow-none w-[300px] h-auto">
      <CardHeader>
        <CardTitle>Startups</CardTitle>
        <CardDescription>
          {chartData.length > 0
            ? `${chartData[0].year} - ${chartData[chartData.length - 1].year}`
            : "No data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 25,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 4)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="Startups" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this year <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total Startups
        </div>
      </CardFooter>
    </Card>
  );
}
