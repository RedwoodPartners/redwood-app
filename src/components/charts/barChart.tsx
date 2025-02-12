"use client";

import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Models } from "appwrite";
import { STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";

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
    label: "Domains",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

interface ChartDataItem {
  domain: string;
  startups: number;
}

export function BarChartPortfolio() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await databases.listDocuments<Models.Document>(STAGING_DATABASE_ID, STARTUP_ID);
        const startups = response.documents;

        const domainCounts: { [key: string]: number } = startups.reduce((acc, startup) => {
          const domain = startup.domain || "Other";
          acc[domain] = (acc[domain] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const sortedDomains = Object.entries(domainCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 9);

        const formattedData: ChartDataItem[] = sortedDomains.map(([domain, count]) => ({
          domain,
          startups: count,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomains();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Domains</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ChartContainer config={chartConfig}>
          <BarChart
            width={500}
            height={300}
            data={chartData}
            layout="vertical"
            margin={{
              right: 15,
              left: 20,
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="domain"
              type="category"
              tickLine={false}
              axisLine={false}
              width={120}
            />

            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              domain={[0, "dataMax"]}
              ticks={Array.from({ length: Math.floor(Math.max(...chartData.map(d => d.startups)) / 1) }, (_, i) => i + 1)}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.2)" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="startups" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
              {/* Display domain names inside the bars 
              <LabelList
                dataKey="domain"
                position="inside"
                className="fill-background font-medium"
                fontSize={12}
                offset={-10}
              />*/}
              {/* Display startup counts outside the bars */}
              <LabelList
                dataKey="startups"
                position="right"
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
