"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { STAGING_DATABASE_ID, STARTUP_ID } from "@/appwrite/config";
import { databases } from "@/lib/utils";

const chartConfig: ChartConfig = {
  desktop: {
    label: "Startups",
    color: "hsl(var(--chart-1))",
  },
};

export function LineChartPortfolio() {
  const [chartData, setChartData] = useState<{ year: string; Startups: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const response = await databases.listDocuments(STAGING_DATABASE_ID, STARTUP_ID);
        const startups = response.documents;

        // Process data to group startups by extracted year
        const startupsByYear: { [key: string]: number } = startups.reduce((acc, startup) => {
          if (!startup.year) return acc;

          const yearMatch = startup.year.match(/\d{4}$/); // Extracts last 4 digits (Year)
          const year = yearMatch ? yearMatch[0] : "Unknown";

          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        // Format data for the chart
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

  const handleLineClick = (data: any) => {
    if (data?.activePayload?.[0]) {
      const year = data.activePayload[0].payload.year;
      router.push(`/home/${year}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Startups - Year wise</CardTitle>
        <CardDescription>
          {chartData.length > 0
            ? `${chartData[0].year} - ${chartData[chartData.length - 1].year}`
            : "No data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, left: 15, right: 15 }}
            onClick={handleLineClick}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="Startups"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{ fill: "var(--color-desktop)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
