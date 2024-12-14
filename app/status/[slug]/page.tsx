import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PublicServiceList } from "@/components/public/service-list"
import { PublicIncidentList } from "@/components/public/incident-list"

interface StatusPageProps {
  params: {
    slug: string
  }
}

export default async function StatusPage({ params }: StatusPageProps) {
  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    include: {
      services: true,
      incidents: {
        where: {
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
          service: true,
          updates: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          }
        }
      }
    }
  })

  if (!organization) {
    notFound()
  }

  // Sort services by name
  const sortedServices = [...organization.services].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  // Sort incidents by startedAt date
  const sortedIncidents = [...organization.incidents].sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )

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
          
          <PublicServiceList services={sortedServices} />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Incidents
            </h2>
            <PublicIncidentList incidents={sortedIncidents} />
          </div>
        </div>
      </div>
    </div>
  )
}
