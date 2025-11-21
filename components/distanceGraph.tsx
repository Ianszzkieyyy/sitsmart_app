"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
  time: {
    label: "Time (s)",
    color: "var(--chart-2)",
  }
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
            time: reading.timestamp,
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
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              }}
            />
            <YAxis dataKey="distance" domain={['dataMin - 5', 'dataMax + 5']} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
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
