import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function PublicStatusPage() {
  // Get the first organization
  const organization = await prisma.organization.findFirst({
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
    return redirect("/setup")
  }

  // Redirect to the organization's status page
  return redirect(`/status/${organization.slug}`)
}
