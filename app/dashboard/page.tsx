import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Activity, AlertCircle, Settings, Shield, Users } from "lucide-react"

export default async function Dashboard() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  // Check if user has an organization
  const organization = await prisma.organization.findFirst({
    where: {
      users: {
        some: {
          clerkId: userId
        }
      }
    },
    include: {
      services: true,
      incidents: true
    }
  })

  if (!organization) {
    redirect("/setup")
  }

  const activeIncidents = organization.incidents?.filter(
    incident => incident.status === "INVESTIGATING" || incident.status === "IDENTIFIED"
  ) || []

  const operationalServices = organization.services?.filter(
    service => service.status === "OPERATIONAL"
  ) || []

  const totalServices = organization.services?.length || 0
  const totalIncidents = activeIncidents.length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to {organization.name}</h1>
          <p className="text-muted-foreground mt-1">Manage your services and monitor system status</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/services/new">
            Add New Service
          </Link>
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Operational Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationalServices.length}/{totalServices}</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
              Active Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Services</CardTitle>
            </div>
            <CardDescription>Monitor and manage your service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {operationalServices.length} of {totalServices} services operational
              </div>
              <Link href="/dashboard/services">
                <Button className="w-full">Manage Services</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>Incidents</CardTitle>
            </div>
            <CardDescription>Track and resolve service incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {totalIncidents} active incidents
              </div>
              <Link href="/dashboard/incidents">
                <Button className="w-full">View Incidents</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Team</CardTitle>
            </div>
            <CardDescription>Manage your organization and team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Manage team access and settings
              </div>
              <Link href="/dashboard/team">
                <Button className="w-full">Team Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
