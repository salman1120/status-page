import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { ServiceStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface ServiceMetricBody {
  status: ServiceStatus
  latency: number
  uptime: number
}

export async function GET(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        organizationId: user.organization.id,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const metrics = await prisma.serviceMetric.findMany({
      where: {
        serviceId: params.serviceId,
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: 100, // Last 100 data points
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('[SERVICE_METRICS_GET]', error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        organizationId: user.organization.id,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const body = await req.json() as ServiceMetricBody

    // Validate required fields
    if (!body.status || typeof body.latency !== 'number' || typeof body.uptime !== 'number') {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      )
    }

    // Validate status
    if (!Object.values(ServiceStatus).includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid service status" },
        { status: 400 }
      )
    }

    const metric = await prisma.serviceMetric.create({
      data: {
        serviceId: params.serviceId,
        status: body.status,
        latency: body.latency,
        uptime: body.uptime,
      },
    })

    return NextResponse.json(metric)
  } catch (error) {
    console.error('[SERVICE_METRICS_POST]', error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
