import * as React from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer } from "./ChartContainer"

interface BarChartProps {
  data: any[]
  categories: string[]
  index: string
  colors: string[]
  height?: number
  yAxisWidth?: number
  className?: string
}

export function BarChart({
  data,
  categories,
  index,
  colors,
  height = 400,
  yAxisWidth = 40,
  className,
}: BarChartProps) {
  const config = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { theme: { light: `hsl(${i * 50}, 100%, 50%)`, dark: colors[i] } },
    ])
  )

  return (
    <ChartContainer className={className} config={config}>
      <RechartsBarChart data={data}>
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip />
        {categories.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            fill={`var(--color-${category})`}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}