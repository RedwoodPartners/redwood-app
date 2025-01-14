"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
const chartData = [
  { month: "2020", desktop: 186 },
  { month: "2021", desktop: 305 },
  { month: "2022", desktop: 237 },
  { month: "2023", desktop: 73 },
  { month: "2024", desktop: 209 },
  { month: "2025", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Startups",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function AreaChartPortfolio() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Rased - Year wise</CardTitle>
        <CardDescription>
          Amount crores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 4)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
