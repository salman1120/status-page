import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

/**
 * Simulates checking a service's health by generating random metrics
 * In production, this should be replaced with actual health checks
 */
async function checkServiceHealth(url: string): Promise<{ status: ServiceStatus; latency: number }> {
  const start = Date.now()
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const latency = Date.now() - start
    return {
      status: response.ok ? ServiceStatus.OPERATIONAL : ServiceStatus.MAJOR_OUTAGE,
      latency
    }
  } catch (error) {
    return {
      status: ServiceStatus.MAJOR_OUTAGE,
      latency: Date.now() - start
    }
  }
}

/**
 * GET /api/cron/collect-metrics
 * Collects metrics for all services and updates their status
 * This endpoint should be called by a cron job every minute
 */
export async function GET() {
  try {
    // Get all services
    const services = await prisma.service.findMany({
      where: {
        monitoringEnabled: true
      }
    })

    // Check each service and create metrics
    const results = await Promise.all(
      services.map(async (service) => {
        if (!service.url) return null

        const { status, latency } = await checkServiceHealth(service.url)

        // Create metric record
        const metric = await prisma.serviceMetric.create({
          data: {
            serviceId: service.id,
            status,
            latency,
            uptime: status === ServiceStatus.OPERATIONAL ? 100 : 0
          }
        })

        // Update service status if changed
        await prisma.service.update({
          where: { id: service.id },
          data: { status }
        })

        return metric
      })
    )

    return NextResponse.json({ success: true, metrics: results.filter(Boolean) })
  } catch (error) {
    console.error("[COLLECT_METRICS]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
