"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type UptimeData = {
  timestamp: string
  uptime: number
}

export function UptimeGraph({ serviceId }: { serviceId: string }) {
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([])

  useEffect(() => {
    fetchUptimeData()
  }, [serviceId])

  const fetchUptimeData = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}/uptime`)
      const data = await response.json()
      setUptimeData(data)
    } catch (error) {
      console.error("Failed to fetch uptime data:", error)
    }
  }

  const data = {
    labels: uptimeData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Uptime %",
        data: uptimeData.map(d => d.uptime),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const
      },
      title: {
        display: true,
        text: "Service Uptime"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  }

  return (
    <div className="w-full h-64">
      <Line data={data} options={options} />
    </div>
  )
}
