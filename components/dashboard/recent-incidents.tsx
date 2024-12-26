import { Incident } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"

interface RecentIncidentsProps extends React.HTMLAttributes<HTMLDivElement> {
  incidents: Array<Incident & {
    service: { id: string; name: string }
    updates: Array<{ id: string; message: string; createdAt: Date }>
  }>
}

export function RecentIncidents({ incidents, className, ...props }: RecentIncidentsProps) {
  if (incidents.length === 0) {
    return null
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {incident.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {incident.service.name}
                </p>
              </div>
              <StatusBadge status={incident.status.toLowerCase()} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
