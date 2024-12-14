import { ServiceStatus } from "@prisma/client"

export interface ServiceMetric {
  id: string
  status: ServiceStatus
  serviceId: string
  timestamp: Date
  latency: number
  uptime: number
}

export interface ServiceMetricDisplay {
  id: string
  status: ServiceStatus
  serviceId: string
  timestamp: string // ISO string for display
  latency: number
  uptime: number
}
