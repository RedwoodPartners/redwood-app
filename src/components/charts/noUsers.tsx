"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
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
import { PROJECT_ID, API_ENDPOINT } from "@/appwrite/config";
import { API_KEY } from "@/pages/api/users";
import { Users, Client } from "node-appwrite";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function NoUsers() {
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [chartData, setChartData] = React.useState<
    Array<{ browser: string; visitors: number; fill: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const client = new Client();
    client.setEndpoint(API_ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
    const users = new Users(client);

    const fetchUsers = async () => {
      try {
        const response = await users.list();
        setTotalUsers(response.total);

        // Generate random data for the chart
        const browsers = ["chrome", "safari", "firefox", "edge", "other"];
        const newChartData = browsers.map((browser) => ({
          browser,
          visitors: Math.floor(Math.random() * (response.total / 2)),
          fill: `var(--color-${browser})`,
        }));
        setChartData(newChartData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  if (loading) {
    return <>
        <div className="flex justify-center mt-44">
          <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" role="img">
          <title id="title">Loading...</title>
          <circle cx="50" cy="50" r="35" stroke="gray" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="55 35">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
          </circle>
          </svg>
        </div>
    </>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex justify-center">
      <Card className="flex flex-col shadow-none w-[300px] h-auto">
        <CardHeader className="items-center">
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>Current Statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <ChartContainer config={chartConfig} className="">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={40}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalUsers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Users
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Total registered users
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
