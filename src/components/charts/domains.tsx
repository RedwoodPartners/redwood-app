"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Client, Databases, Models } from "appwrite"
import { DATABASE_ID, STARTUP_ID, PROJECT_ID, API_ENDPOINT } from "@/appwrite/config"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  visitors: {
    label: "Startups",
  },
} satisfies ChartConfig

interface ChartDataItem {
  browser: string;
  visitors: number;
  fill: string;
}

export function Domain() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([])

  useEffect(() => {
    const fetchDomains = async () => {
      const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID)
      const databases = new Databases(client)

      try {
        const response = await databases.listDocuments<Models.Document>(DATABASE_ID, STARTUP_ID)
        const startups = response.documents

        const domainCounts: { [key: string]: number } = startups.reduce((acc, startup) => {
          const domain = startup.domain || "Other"
          acc[domain] = (acc[domain] || 0) + 1
          return acc
        }, {} as { [key: string]: number })

        const sortedDomains = Object.entries(domainCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)

        const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

        const formattedData: ChartDataItem[] = sortedDomains.map(([domain, count], index) => ({
          browser: domain,
          visitors: count,
          fill: colors[index],
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching domains:", error)
      }
    }

    fetchDomains()
  }, [])


  
  return (
      <Card className="flex flex-col w-[300px]">
        <CardHeader className="items-center pb-0">
          <CardTitle>Top 5 Domains</CardTitle>
          <CardDescription>Current Data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className=""
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={40}
                strokeWidth={5}
                activeIndex={0}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <Sector {...props} outerRadius={outerRadius + 10} />
                )}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          
          <div className="flex flex-col gap-1 mt-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                ></div>
                <span>{item.browser}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 font-medium leading-none">
            Showing top 5 domains <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    )
  
}
  
