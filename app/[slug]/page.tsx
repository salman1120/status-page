import { clerkClient } from "@clerk/nextjs"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Shell } from "@/components/layout/shell"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function PublicStatusPage({
  params
}: {
  params: { slug: string }
}) {
  try {
    // Get organization by slug
    const organizations = await clerkClient.organizations.getOrganizationList({
      slug: [params.slug]
    })
    
    const organization = organizations[0]
    if (!organization) {
      return notFound()
    }

    // Get services for the organization
    const services = await prisma.service.findMany({
      where: {
        organizationId: organization.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return (
      <Shell>
        <div className="flex-1 space-y-6 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{organization.name} Status</h1>
          </div>

          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {service.name}
                  </CardTitle>
                  <StatusBadge status={service.status} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Shell>
    )
  } catch (error) {
    console.error("Error loading public status page:", error)
    return notFound()
  }
}
