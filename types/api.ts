import { IncidentStatus, ServiceStatus } from "@prisma/client"

/**
 * API request and response types for service-related endpoints
 */
export interface CreateServiceRequest {
  name: string
  description?: string
  organizationId: string
}

export interface UpdateServiceRequest {
  name?: string
  description?: string
  status?: ServiceStatus
}

export interface ServiceResponse {
  id: string
  name: string
  description?: string
  status: ServiceStatus
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * API request and response types for incident-related endpoints
 */
export interface CreateIncidentRequest {
  title: string
  description: string
  serviceId: string
  organizationId: string
}

export interface UpdateIncidentRequest {
  title?: string
  description?: string
  status?: IncidentStatus
  resolvedAt?: Date | null
}

export interface IncidentResponse {
  id: string
  title: string
  description: string
  status: IncidentStatus
  serviceId: string
  organizationId: string
  createdById: string
  startedAt: Date
  resolvedAt?: Date
}

/**
 * API request and response types for metrics-related endpoints
 */
export interface CreateMetricRequest {
  serviceId: string
  status: ServiceStatus
  latency?: number
  uptime: number
}

export interface MetricResponse {
  id: string
  serviceId: string
  status: ServiceStatus
  timestamp: Date
  latency?: number
  uptime: number
}

/**
 * Common API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
