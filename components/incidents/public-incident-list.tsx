'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ExtendedIncidentDisplay } from "@/types"

interface PublicIncidentListProps {
  incidents: ExtendedIncidentDisplay[]
}

export function PublicIncidentList({ incidents }: PublicIncidentListProps) {
  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                {incident.title}
              </CardTitle>
              <Badge
                variant={
                  incident.status === "RESOLVED"
                    ? "default"
                    : incident.status === "INVESTIGATING"
                    ? "destructive"
                    : "warning"
                }
              >
                {incident.status.toLowerCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Affected Service: {incident.service.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Started: {formatDistanceToNow(new Date(incident.startedAt))} ago
                </p>
                {incident.resolvedAt && (
                  <p className="text-sm text-muted-foreground">
                    Resolved: {formatDistanceToNow(new Date(incident.resolvedAt))} ago
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Updates</h4>
                {incident.updates?.map((update) => (
                  <div key={update.id} className="text-sm">
                    <p className="text-muted-foreground">
                      {formatDistanceToNow(new Date(update.createdAt))} ago
                    </p>
                    <p>{update.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
