"use client"

import { Incident, IncidentStatus } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

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

interface PublicIncidentListProps {
  incidents: ExtendedIncident[]
}

export function PublicIncidentList({ incidents }: PublicIncidentListProps) {
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
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No active incidents
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-semibold">{incident.title}</h3>
              <Badge 
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-medium border",
                  statusConfig[incident.status].color
                )}
              >
                <span className="mr-1">{statusConfig[incident.status].icon}</span>
                {statusConfig[incident.status].label}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground mb-4">
              <div>Affected Service: {incident.service.name}</div>
              <div>Started {formatDate(incident.startedAt)}</div>
              {incident.resolvedAt && (
                <div>Resolved {formatDate(incident.resolvedAt)}</div>
              )}
            </div>

            {incident.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {incident.description}
              </p>
            )}

            {incident.updates?.length > 0 && (
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Latest Updates</h4>
                  {incident.updates.map((update) => (
                    <div key={update.id} className="text-sm text-muted-foreground">
                      <span className="font-medium">
                        {formatDate(update.createdAt)}:
                      </span>{" "}
                      {update.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
