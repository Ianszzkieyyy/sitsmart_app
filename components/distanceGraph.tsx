"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
import { useState, useEffect } from "react"

export const description = "A line chart"

const chartConfig = {
  distance: {
    label: "Distance (cm)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface DistanceGraphProps {
    sessionData: any[];
    sessionStartTime: Date;
    isActive: boolean;
}

export default function DistanceGraph({ sessionData, isActive, sessionStartTime }: DistanceGraphProps) {
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        if (!isActive || !sessionData || sessionData.length === 0) {
            return
        }

        const newData = sessionData.map((reading: any) => ({
            time: reading.time,
            distance: reading.distance,
        }))

        setChartData(newData)
    }, [isActive, sessionData])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Real-Time Distance Data</CardTitle>
        <CardDescription>From {sessionStartTime?.toLocaleTimeString()} to {new Date().toLocaleTimeString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="distance"
              type="natural"
              stroke="var(--color-distance)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
