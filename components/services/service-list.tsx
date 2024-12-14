"use client"

import { useEffect, useState } from "react"
import { ServiceStatus } from "@prisma/client"
import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  XCircle,
  Loader2
} from "lucide-react"

type Service = {
  id: string
  name: string
  description: string
  status: ServiceStatus
}

const statusConfig = {
  OPERATIONAL: {
    label: "Operational",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-300/20",
    icon: CheckCircle2,
    iconColor: "text-emerald-500"
  },
  DEGRADED_PERFORMANCE: {
    label: "Degraded",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-300/20",
    icon: AlertTriangle,
    iconColor: "text-yellow-500"
  },
  PARTIAL_OUTAGE: {
    label: "Partial Outage",
    color: "bg-orange-500/10 text-orange-700 border-orange-300/20",
    icon: AlertCircle,
    iconColor: "text-orange-500"
  },
  MAJOR_OUTAGE: {
    label: "Major Outage",
    color: "bg-red-500/10 text-red-700 border-red-300/20",
    icon: XCircle,
    iconColor: "text-red-500"
  }
}

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()

    const channel = pusherClient.subscribe("services")
    channel.bind("service-updated", (service: Service) => {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? service : s))
      )
    })

    return () => {
      pusherClient.unsubscribe("services")
    }
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/services")
      if (!response.ok) {
        throw new Error("Failed to fetch services")
      }
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch services")
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (serviceId: string, newStatus: ServiceStatus) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error("Failed to update service status")
      }
    } catch (error) {
      console.error("Failed to update service status:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading services...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="mt-2 text-lg font-medium text-destructive">Error loading services</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </Card>
    )
  }

  if (!services.length) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium">No services</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new service
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => {
        const status = statusConfig[service.status]
        const StatusIcon = status.icon

        return (
          <Card key={service.id} className="overflow-hidden">
            <div className="border-l-4 border-l-transparent hover:border-l-primary transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold leading-6 text-foreground">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-6 flex items-center">
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "h-7 rounded-full px-3 font-medium",
                        status.color
                      )}
                    >
                      <StatusIcon className={cn("w-4 h-4 mr-2", status.iconColor)} />
                      {status.label}
                    </Badge>
                  </div>
                </div>
                <div className="mt-6">
                  <select
                    value={service.status}
                    onChange={(e) => updateStatus(service.id, e.target.value as ServiceStatus)}
                    className="w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {Object.entries(ServiceStatus).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.split('_').map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
