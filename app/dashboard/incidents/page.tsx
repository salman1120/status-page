import { Heading } from "@/components/ui/heading"
import { IncidentForm } from "@/components/incidents/incident-form"
import { IncidentList } from "@/components/incidents/incident-list"
import { Separator } from "@/components/ui/separator"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function IncidentsPage() {
  const { userId, orgId } = auth()
  
  if (!userId || !orgId) {
    redirect("/sign-in")
  }

  // Get services for the organization
  const services = await prisma.service.findMany({
    where: {
      organizationId: orgId
    }
  })

  // Get incidents for the organization
  const incidents = await prisma.incident.findMany({
    where: {
      organizationId: orgId
    },
    include: {
      service: true,
      updates: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      startedAt: 'desc'
    }
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading title="Incidents" description="View and manage service incidents" />
        </div>
        <IncidentForm services={services} />
      </div>
      <Separator />
      <IncidentList initialIncidents={incidents} />
    </div>
  )
}
