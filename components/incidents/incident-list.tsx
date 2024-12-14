"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Incident, IncidentStatus } from "@prisma/client"
import { pusherClient } from "@/lib/pusher"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ExtendedIncident extends Incident {
  service: {
    name: string
  }
  updates: {
    id: string
    message: string
    createdAt: string
  }[]
}

interface IncidentListProps {
  initialIncidents: ExtendedIncident[]
}

const statusConfig = {
  [IncidentStatus.INVESTIGATING]: {
    label: "Investigating",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: "🔍"
  },
  [IncidentStatus.IDENTIFIED]: {
    label: "Identified",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    icon: "🎯"
  },
  [IncidentStatus.MONITORING]: {
    label: "Monitoring",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: "👀"
  },
  [IncidentStatus.RESOLVED]: {
    label: "Resolved",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: "✅"
  },
}

export function IncidentList({ initialIncidents = [] }: IncidentListProps) {
  const [incidents, setIncidents] = useState<ExtendedIncident[]>(initialIncidents)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    setIncidents(initialIncidents)
  }, [initialIncidents])

  useEffect(() => {
    const channel = pusherClient.subscribe("incidents")
    
    channel.bind("incident-created", (incident: ExtendedIncident) => {
      setIncidents((current) => {
        if (current.some(i => i.id === incident.id)) {
          return current
        }
        return [incident, ...current]
      })
    })

    channel.bind("incident-updated", (incident: ExtendedIncident) => {
      setIncidents((current) =>
        current.map((i) => (i.id === incident.id ? incident : i))
      )
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe("incidents")
    }
  }, [])

  const updateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      setLoading(incidentId)
      toast.success("Status updating")
      const response = await fetch(`/api/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }

      toast.success("Status updated successfully")
    } catch (error) {
      console.error("Failed to update incident status:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update status")
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return ""
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Date unavailable"
    }
  }

  if (!incidents.length) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No incidents reported. All systems operational.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {incident.title}
                  <Badge 
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs font-medium border",
                      statusConfig[incident.status].color
                    )}
                  >
                    <span className="mr-1">{statusConfig[incident.status].icon}</span>
                    {statusConfig[incident.status].label}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Affected Service: {incident.service.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Started {formatDate(incident.startedAt)}
                </div>
              </div>
            </div>
          </CardHeader>
          {incident.description && (
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">{incident.description}</p>
            </CardContent>
          )}
          {incident.updates?.length > 0 && (
            <CardContent className="border-t bg-muted/50 pb-3">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Timeline</h4>
                {incident.updates.map((update) => (
                  <div key={update.id} className="text-sm text-muted-foreground">
                    <span className="font-medium">
                      {formatDate(update.createdAt)}:
                    </span>{" "}
                    {update.message}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
          <CardContent className="border-t pt-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusConfig).map(([status, config]) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(incident.id, status as IncidentStatus)}
                  disabled={loading === incident.id}
                  className={cn(
                    "border transition-colors",
                    incident.status === status ? config.color : "hover:" + config.color
                  )}
                >
                  <span className="mr-1">{config.icon}</span>
                  {config.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
