import { notFound } from "next/navigation"
import { clerkClient } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { PublicServiceList } from "@/components/public/service-list"
import { PublicIncidentList } from "@/components/public/incident-list"

export const dynamic = 'force-dynamic'

interface StatusPageProps {
  params: {
    slug: string
  }
}

export default async function StatusPage({ params }: StatusPageProps) {
  try {
    // Get organization from Clerk
    const organizations = await clerkClient.organizations.getOrganizationList({
      slug: [params.slug]
    })
    
    const organization = organizations[0]
    if (!organization) {
      return notFound()
    }

    // Get services and incidents from Prisma
    const [services, incidents] = await Promise.all([
      prisma.service.findMany({
        where: { organizationId: organization.id },
        orderBy: { name: 'asc' }
      }),
      prisma.incident.findMany({
        where: {
          organizationId: organization.id,
          OR: [
            { status: "INVESTIGATING" },
            { status: "IDENTIFIED" },
            { status: "MONITORING" },
            { 
              AND: [
                { status: "RESOLVED" },
                { resolvedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
              ]
            }
          ]
        },
        include: {
          service: true
        },
        orderBy: {
          startedAt: 'desc'
        }
      })
    ])

    // Format incidents dates
    const formattedIncidents = incidents.map(incident => ({
      ...incident,
      startedAt: incident.startedAt.toISOString(),
      resolvedAt: incident.resolvedAt ? incident.resolvedAt.toISOString() : null
    }))

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                System Status
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Current status of {organization.name}&apos;s services
              </p>
            </div>
            
            <PublicServiceList services={services} />
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Incidents
              </h2>
              <PublicIncidentList incidents={formattedIncidents} />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading status page:", error)
    return notFound()
  }
}
