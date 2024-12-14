"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceStatus } from "@prisma/client"
import { Card } from "@/components/ui/card"

export function ServiceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: ServiceStatus.OPERATIONAL
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create service")
      }

      // Clear form
      setFormData({
        name: "",
        description: "",
        status: ServiceStatus.OPERATIONAL
      })
      
      router.push("/dashboard/services")
      router.refresh()
    } catch (error) {
      console.error("Error creating service:", error)
      setError("Failed to create service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Service Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="Enter service name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter service description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Initial Status
          </label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ServiceStatus).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key.split("_").map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Service"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
