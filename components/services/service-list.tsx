"use client"

import { useEffect, useState } from "react"
import { Service, ServiceStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { pusherClient } from "@/lib/pusher"

const statusColors = {
  [ServiceStatus.OPERATIONAL]: "bg-green-500",
  [ServiceStatus.DEGRADED_PERFORMANCE]: "bg-yellow-500",
  [ServiceStatus.PARTIAL_OUTAGE]: "bg-orange-500",
  [ServiceStatus.MAJOR_OUTAGE]: "bg-red-500",
}

const statusLabels = {
  [ServiceStatus.OPERATIONAL]: "Operational",
  [ServiceStatus.DEGRADED_PERFORMANCE]: "Degraded Performance",
  [ServiceStatus.PARTIAL_OUTAGE]: "Partial Outage",
  [ServiceStatus.MAJOR_OUTAGE]: "Major Outage",
}

interface ServiceListProps {
  initialServices?: Service[]
}

export function ServiceList({ initialServices = [] }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  useEffect(() => {
    const channel = pusherClient.subscribe("services")

    channel.bind("service-created", (service: Service) => {
      setServices((current) => {
        if (current.some(s => s.id === service.id)) {
          return current
        }
        return [...current, service]
      })
    })

    channel.bind("service-updated", (updatedService: Service) => {
      setServices((current) =>
        current.map((service) =>
          service.id === updatedService.id ? updatedService : service
        )
      )
    })

    channel.bind("service-deleted", (serviceId: string) => {
      setServices((current) => current.filter((service) => service.id !== serviceId))
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe("services")
    }
  }, [])

  const updateServiceStatus = async (serviceId: string, newStatus: ServiceStatus) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/services/${serviceId}`, {
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
      console.error("Error updating service status:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId: string) => {
    try {
      setDeletingId(serviceId)
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete service")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (!Array.isArray(services)) {
    return null
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No services found. Add your first service to get started.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => (
        <Card key={service.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{service.name}</CardTitle>
                {service.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Select
                  defaultValue={service.status}
                  onValueChange={(value) => 
                    updateServiceStatus(service.id, value as ServiceStatus)
                  }
                  disabled={loading || deletingId === service.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[service.status as ServiceStatus]}>
                          {statusLabels[service.status as ServiceStatus]}
                        </Badge>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ServiceStatus).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[value]}>
                            {statusLabels[value]}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => deleteService(service.id)}
                  disabled={deletingId === service.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
