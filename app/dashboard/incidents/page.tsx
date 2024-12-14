import { IncidentForm } from "@/components/incidents/incident-form"
import { IncidentList } from "@/components/incidents/incident-list"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ExtendedIncident } from "@/types"

export default async function IncidentsPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organization: {
        include: {
          services: true,
          incidents: {
            include: {
              service: true,
              updates: true
            }
          }
        }
      }
    }
  })

  if (!user?.organization) {
    redirect("/setup")
  }

  // Sort incidents by creation time
  const incidents = user.organization.incidents as unknown as ExtendedIncident[]
  const sortedIncidents = [...incidents].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading title="Incidents" description="Track and manage service incidents" />
        </div>
        <IncidentForm services={user.organization.services} />
      </div>
      <Separator />
      <IncidentList initialIncidents={sortedIncidents} />
    </div>
  )
}
