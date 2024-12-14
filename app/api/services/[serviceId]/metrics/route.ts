import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        organizationId: orgId,
      },
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
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
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        organizationId: orgId,
      },
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    const body = await req.json()
    const { status, latency, uptime } = body

    const metric = await prisma.serviceMetric.create({
      data: {
        serviceId: params.serviceId,
        status,
        latency,
        uptime,
      },
    })

    return NextResponse.json(metric)
  } catch (error) {
    console.error('[SERVICE_METRICS_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
