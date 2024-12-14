'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js'
import { Card } from '@/components/ui/card'
import { useEffect, useRef } from "react"
import { ServiceMetric } from "@prisma/client"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface UptimeChartProps {
  /** List of service metrics to display */
  data: ServiceMetric[]
  /** Name of the service */
  serviceName: string
}

/**
 * UptimeChart Component
 * 
 * Displays a line chart showing service uptime over time.
 * Uses Chart.js for rendering with a responsive design.
 * 
 * @example
 * ```tsx
 * <UptimeChart 
 *   data={serviceMetrics} 
 *   serviceName="My Service"
 * />
 * ```
 */
export function UptimeChart({ data, serviceName }: UptimeChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => new Date(d.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Uptime %',
        data: data.map(d => d.uptime),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${serviceName} Uptime`,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
  }

  return (
    <Card className="p-6">
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </Card>
  )
}
