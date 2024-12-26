'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity, AlertCircle, Settings, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Shell } from "@/components/layout/shell"
import { useAuth } from "@clerk/nextjs"
import { Service, Incident } from "@prisma/client"
import { pusherClient } from "@/lib/pusher"

interface DashboardClientProps {
  initialServices: Service[]
  initialIncidents: (Incident & {
    service: Service
    updates: { message: string }[]
  })[]
  organization: {
    name: string
  }
}

export function DashboardClient({ 
  initialServices = [],
  initialIncidents = [],
  organization 
}: DashboardClientProps) {
  const { orgId } = useAuth()
  const [services, setServices] = useState<Service[]>(initialServices)
  const [incidents, setIncidents] = useState(initialIncidents)

  // Calculate service status counts
  const operationalServices = services.filter(service => service.status === "OPERATIONAL")
  const majorOutageServices = services.filter(service => service.status === "MAJOR_OUTAGE")

  useEffect(() => {
    if (!orgId) return

    // Subscribe to service updates
    const channel = pusherClient.subscribe(orgId)
    
    channel.bind('service:updated', (service: Service) => {
      setServices(prev => prev.map(s => s.id === service.id ? service : s))
    })

    channel.bind('service:created', (service: Service) => {
      setServices(prev => [...prev, service])
    })

    channel.bind('service:deleted', (serviceId: string) => {
      setServices(prev => prev.filter(s => s.id !== serviceId))
    })

    // Subscribe to incident updates
    channel.bind('incident:created', (incident: any) => {
      setIncidents(prev => [incident, ...prev].slice(0, 3))
    })

    channel.bind('incident:updated', (incident: any) => {
      setIncidents(prev => prev.map(i => i.id === incident.id ? incident : i))
    })

    channel.bind('incident:deleted', (incidentId: string) => {
      setIncidents(prev => prev.filter(i => i.id !== incidentId))
    })

    return () => {
      channel.unbind()
      pusherClient.unsubscribe(orgId)
    }
  }, [orgId])

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
                  <div className="text-2xl font-bold">{incidents.length}</div>
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
                  <div className="text-2xl font-bold">-</div>
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
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Configure dashboard
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Incidents */}
        {incidents.length > 0 && (
          <div className="space-y-4">
            <Link href="/dashboard/incidents">
              <h2 className="text-lg font-semibold tracking-tight hover:text-primary cursor-pointer">Recent Incidents</h2>
            </Link>
            <div className="grid gap-4">
              {incidents.map((incident) => (
                <Link key={incident.id} href={`/dashboard/incidents/${incident.id}`}>
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
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {incident.updates[0]?.message || incident.description}
                      </p>
                    </CardContent>
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
