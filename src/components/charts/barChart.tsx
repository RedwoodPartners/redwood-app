"use client"

import { Bar, BarChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { date: "2024-07-15", IOT: 450, BioTech: 300 },
  { date: "2024-07-16", IOT: 380, BioTech: 420 },
  { date: "2024-07-17", IOT: 520, BioTech: 120 },
  { date: "2024-07-18", IOT: 140, BioTech: 550 },
  { date: "2024-07-19", IOT: 600, BioTech: 350 },
  { date: "2024-07-20", IOT: 480, BioTech: 400 },
]

const chartConfig = {
  running: {
    label: "IOT",
    color: "hsl(var(--chart-1))",
  },
  swimming: {
    label: "BioTech",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function BarChartPortfolio() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Distribution - year wise</CardTitle>
        <CardDescription>
          50+ Domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                })
              }}
            />
            <Bar
              dataKey="IOT"
              stackId="a"
              fill="var(--color-running)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="BioTech"
              stackId="a"
              fill="var(--color-swimming)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
