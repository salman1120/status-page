import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function calculateOverallStatus(statuses: ServiceStatus[]): ServiceStatus {
  if (statuses.includes(ServiceStatus.MAJOR_OUTAGE)) return ServiceStatus.MAJOR_OUTAGE
  if (statuses.includes(ServiceStatus.PARTIAL_OUTAGE)) return ServiceStatus.PARTIAL_OUTAGE
  if (statuses.includes(ServiceStatus.DEGRADED_PERFORMANCE)) return ServiceStatus.DEGRADED_PERFORMANCE
  return ServiceStatus.OPERATIONAL
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        metrics: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    })

    const statuses = services.map((service) => service.status)
    const overallStatus = calculateOverallStatus(statuses)

    const response = {
      status: overallStatus,
      updated: new Date().toISOString(),
      services: services.map((service) => ({
        name: service.name,
        status: service.status,
        metrics: service.metrics[0] || null,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[STATUS_V1]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
