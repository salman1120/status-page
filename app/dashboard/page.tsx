import { auth, clerkClient } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Activity, AlertCircle, Settings, Shield, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Shell } from "@/components/layout/shell"

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const { userId, orgId } = auth()
  
  if (!userId || !orgId) {
    redirect("/sign-in")
  }

  // Get organization details from Clerk
  const organization = await clerkClient.organizations.getOrganization({ organizationId: orgId })

  // Get services for the organization
  const services = await prisma.service.findMany({
    where: {
      organizationId: orgId
    }
  })

  // Get recent incidents
  const recentIncidents = await prisma.incident.findMany({
    where: {
      organizationId: orgId,
      status: {
        not: "RESOLVED"
      }
    },
    include: {
      service: true,
      updates: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    orderBy: {
      startedAt: "desc"
    },
    take: 3
  })

  // Calculate service status counts
  const operationalServices = services.filter(service => service.status === "OPERATIONAL")
  const majorOutageServices = services.filter(service => service.status === "MAJOR_OUTAGE")

  return (
    <Shell>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to {organization.name} Status Dashboard
            </p>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current status of your services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/dashboard/services?status=operational">
                <div className="space-y-2 rounded-lg border p-4 hover:bg-muted cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Operational Services</p>
                    <StatusBadge status="operational" />
                  </div>
                  <p className="text-2xl font-bold">{operationalServices.length}</p>
                </div>
              </Link>
              <Link href="/dashboard/services?status=major_outage">
                <div className="space-y-2 rounded-lg border p-4 hover:bg-muted cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Major Outages</p>
                    <StatusBadge status="major_outage" />
                  </div>
                  <p className="text-2xl font-bold">{majorOutageServices.length}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">No services found. Add your first service to get started.</p>
            <Link href="/dashboard/services?new=true">
              <Button>Add Service</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/services">
              <Card className="hover:bg-muted cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active services being monitored
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/incidents">
              <Card className="hover:bg-muted cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentIncidents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Ongoing incidents being tracked
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/team" className="block">
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Manage team access
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/settings" className="block">
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Settings</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Configure dashboard
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Incidents */}
        {recentIncidents.length > 0 && (
          <div className="space-y-4">
            <Link href="/dashboard/incidents">
              <h2 className="text-lg font-semibold tracking-tight hover:text-primary cursor-pointer">Recent Incidents</h2>
            </Link>
            <div className="grid gap-4">
              {recentIncidents.map((incident) => (
                <Link key={incident.id} href="/dashboard/incidents">
                  <Card className="hover:bg-muted cursor-pointer transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">
                          {incident.title}
                        </CardTitle>
                        <StatusBadge status={incident.status.toLowerCase()} />
                      </div>
                      <CardDescription>
                        {incident.service.name} • {new Date(incident.startedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
