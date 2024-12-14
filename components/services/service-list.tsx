"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceStatus } from "@prisma/client"
import { pusherClient } from "@/lib/pusher"

type Service = {
  id: string
  name: string
  description: string
  status: ServiceStatus
}

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    // Fetch initial services
    fetchServices()

    // Subscribe to real-time updates
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
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const updateStatus = async (serviceId: string, newStatus: ServiceStatus) => {
    try {
      await fetch(`/api/services/${serviceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error("Failed to update service status:", error)
    }
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{service.name}</CardTitle>
            <Badge
              variant={
                service.status === "OPERATIONAL"
                  ? "default"
                  : service.status === "DEGRADED_PERFORMANCE"
                  ? "warning"
                  : "destructive"
              }
            >
              {service.status.replace("_", " ")}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">{service.description}</p>
            <div className="flex space-x-2">
              {Object.values(ServiceStatus).map((status) => (
                <Button
                  key={status}
                  variant={service.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStatus(service.id, status)}
                >
                  {status.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
