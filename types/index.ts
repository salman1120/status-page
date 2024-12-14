import { Incident, Service, IncidentStatus } from "@prisma/client"

export interface ExtendedIncident {
  id: string
  title: string
  description: string
  status: IncidentStatus
  serviceId: string
  organizationId: string
  createdById: string
  startedAt: Date
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
  service: Service
  updates?: {
    id: string
    message: string
    createdAt: Date | string
    incidentId?: string
  }[]
}

export interface ExtendedIncidentDisplay extends Omit<ExtendedIncident, 'createdAt' | 'updatedAt' | 'startedAt' | 'resolvedAt' | 'updates'> {
  createdAt: string
  updatedAt: string
  startedAt: string
  resolvedAt: string | null
  updates?: {
    id: string
    message: string
    createdAt: string
    incidentId?: string
  }[]
}
