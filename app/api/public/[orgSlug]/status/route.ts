import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        slug: params.orgSlug,
      },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            updatedAt: true,
            metrics: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 1,
              select: {
                uptime: true,
                latency: true,
                timestamp: true,
              },
            },
          },
        },
        incidents: {
          where: {
            status: {
              not: 'RESOLVED',
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            startedAt: true,
            updates: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 })
    }

    // Calculate overall system status
    const statuses = organization.services.map(service => service.status)
    const overallStatus = calculateOverallStatus(statuses)

    // Format response
    const response = {
      name: organization.name,
      status: overallStatus,
      lastUpdated: new Date().toISOString(),
      services: organization.services.map(service => ({
        name: service.name,
        status: service.status,
        uptime: service.metrics[0]?.uptime ?? 100,
        latency: service.metrics[0]?.latency,
        lastUpdated: service.updatedAt,
      })),
      activeIncidents: organization.incidents,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[PUBLIC_STATUS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

function calculateOverallStatus(statuses: string[]) {
  if (statuses.includes('MAJOR_OUTAGE')) return 'MAJOR_OUTAGE'
  if (statuses.includes('PARTIAL_OUTAGE')) return 'PARTIAL_OUTAGE'
  if (statuses.includes('DEGRADED_PERFORMANCE')) return 'DEGRADED_PERFORMANCE'
  return 'OPERATIONAL'
}
