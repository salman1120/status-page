"use client"

import { useState, useEffect } from "react"
import { Service, ServiceStatus } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { pusherClient } from "@/lib/pusher"
import { toast } from "sonner"

const statusConfig: Record<ServiceStatus, { label: string; color: string }> = {
  OPERATIONAL: {
    label: "Operational",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  DEGRADED_PERFORMANCE: {
    label: "Degraded Performance",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  PARTIAL_OUTAGE: {
    label: "Partial Outage",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  MAJOR_OUTAGE: {
    label: "Major Outage",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  UNDER_MAINTENANCE: {
    label: "Under Maintenance",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  }
}

interface ServiceListProps {
  initialServices?: Service[]
}

export function ServiceList({ initialServices = [] }: ServiceListProps) {
  const { orgId } = useAuth()
  const [services, setServices] = useState<Service[]>(initialServices)
  const [loading, setLoading] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  useEffect(() => {
    if (!orgId) return

    const channel = pusherClient.subscribe(orgId)

    channel.bind("service:created", (service: Service) => {
      setServices((current) => {
        if (current.some(s => s.id === service.id)) {
          return current
        }
        return [...current, service]
      })
    })

    channel.bind("service:updated", (updatedService: Service) => {
      setServices((current) =>
        current.map((service) =>
          service.id === updatedService.id ? updatedService : service
        )
      )
    })

    channel.bind("service:deleted", (serviceId: string) => {
      setServices((current) => current.filter((service) => service.id !== serviceId))
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(orgId)
    }
  }, [orgId])

  const updateServiceStatus = async (serviceId: string, newStatus: ServiceStatus) => {
    try {
      setLoading(serviceId)
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update service status")
      }

      const data = await response.json()
      if (data.success) {
        // Update service immediately
        setServices((current) =>
          current.map((service) =>
            service.id === serviceId ? data.data : service
          )
        )
        toast.success("Service status updated")
      }
    } catch (error) {
      console.error("Error updating service status:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update service status")
    } finally {
      setLoading(null)
    }
  }

  const deleteService = async (serviceId: string) => {
    try {
      setDeletingId(serviceId)
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete service")
      }

      const data = await response.json()
      if (data.success) {
        setServices((current) => current.filter((service) => service.id !== serviceId))
        toast.success("Service deleted")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete service")
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
                  value={service.status}
                  onValueChange={(value) => 
                    updateServiceStatus(service.id, value as ServiceStatus)
                  }
                  disabled={loading === service.id || deletingId === service.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <Badge className={statusConfig[service.status].color}>
                        {statusConfig[service.status].label}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ServiceStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge className={statusConfig[status].color}>
                          {statusConfig[status].label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
