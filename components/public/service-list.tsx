"use client"

import { Service, ServiceStatus } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig = {
  [ServiceStatus.OPERATIONAL]: {
    label: "Operational",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  [ServiceStatus.DEGRADED_PERFORMANCE]: {
    label: "Degraded Performance",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  [ServiceStatus.PARTIAL_OUTAGE]: {
    label: "Partial Outage",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  [ServiceStatus.MAJOR_OUTAGE]: {
    label: "Major Outage",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  [ServiceStatus.UNDER_MAINTENANCE]: {
    label: "Under Maintenance",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
}

interface PublicServiceListProps {
  services: Service[]
}

export function PublicServiceList({ services }: PublicServiceListProps) {
  if (!services.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No services found
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id} className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{service.name}</h3>
            <Badge 
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium border",
                statusConfig[service.status].color
              )}
            >
              {statusConfig[service.status].label}
            </Badge>
          </div>
          {service.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {service.description}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}
