import { IncidentForm } from "@/components/incidents/incident-form"
import { IncidentList } from "@/components/incidents/incident-list"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

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
              service: true
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
  const sortedIncidents = [...user.organization.incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
