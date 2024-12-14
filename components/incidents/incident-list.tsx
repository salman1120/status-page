"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IncidentStatus } from "@prisma/client"
import { pusherClient } from "@/lib/pusher"
import { formatDistanceToNow } from "date-fns"

type Incident = {
  id: string
  title: string
  description: string
  status: IncidentStatus
  startedAt: string
  resolvedAt: string | null
  service: {
    name: string
  }
  updates: {
    id: string
    message: string
    createdAt: string
  }[]
}

export function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([])

  useEffect(() => {
    fetchIncidents()

    const channel = pusherClient.subscribe("incidents")
    channel.bind("incident-updated", (incident: Incident) => {
      setIncidents((prev) =>
        prev.map((i) => (i.id === incident.id ? incident : i))
      )
    })

    return () => {
      pusherClient.unsubscribe("incidents")
    }
  }, [])

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/incidents")
      const data = await response.json()
      setIncidents(data)
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    }
  }

  const updateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      await fetch(`/api/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error("Failed to update incident status:", error)
    }
  }

  return (
    <div className="space-y-6">
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{incident.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  Affecting {incident.service.name}
                </p>
              </div>
              <Badge
                variant={
                  incident.status === "RESOLVED"
                    ? "default"
                    : incident.status === "MONITORING"
                    ? "warning"
                    : "destructive"
                }
              >
                {incident.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{incident.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Timeline</h4>
                {incident.updates.map((update) => (
                  <div key={update.id} className="text-sm">
                    <time className="text-gray-500">
                      {formatDistanceToNow(new Date(update.createdAt))} ago
                    </time>
                    <p>{update.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                {Object.values(IncidentStatus).map((status) => (
                  <Button
                    key={status}
                    variant={incident.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus(incident.id, status)}
                  >
                    {status.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
