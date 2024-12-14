import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"

/**
 * Simulates checking a service's health by generating random metrics
 * In production, this should be replaced with actual health checks
 */
async function checkServiceHealth(serviceId: string): Promise<{
  status: ServiceStatus
  latency: number
  uptime: number
}> {
  // Simulate service check with random values
  const latency = Math.random() * 1000 // 0-1000ms
  const uptime = 90 + Math.random() * 10 // 90-100%
  
  // Determine status based on metrics
  let status: ServiceStatus = ServiceStatus.OPERATIONAL
  if (latency > 800) status = ServiceStatus.DEGRADED_PERFORMANCE
  if (latency > 900) status = ServiceStatus.PARTIAL_OUTAGE
  if (uptime < 92) status = ServiceStatus.MAJOR_OUTAGE

  return { status, latency, uptime }
}

/**
 * POST /api/cron/collect-metrics
 * Collects metrics for all services and updates their status
 * This endpoint should be called by a cron job every minute
 */
export async function POST() {
  try {
    // Get all services
    const services = await prisma.service.findMany()
    
    // Check each service and create metrics
    const metrics = await Promise.all(
      services.map(async (service) => {
        const health = await checkServiceHealth(service.id)
        
        // Create metric record
        const metric = await prisma.serviceMetric.create({
          data: {
            serviceId: service.id,
            status: health.status,
            latency: health.latency,
            uptime: health.uptime
          }
        })
        
        // Update service status if changed
        if (service.status !== health.status) {
          await prisma.service.update({
            where: { id: service.id },
            data: { status: health.status }
          })
        }
        
        return metric
      })
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error collecting metrics:", error)
    return NextResponse.json(
      { success: false, error: "Failed to collect metrics" },
      { status: 500 }
    )
  }
}
