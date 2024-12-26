"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceStatus } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ServiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [backendError, setBackendError] = useState("")
  const [nameError, setNameError] = useState("")
  const [touched, setTouched] = useState({
    name: false,
    description: false
  })
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: ServiceStatus.OPERATIONAL
  })

  // Watch for URL parameter changes
  useEffect(() => {
    const shouldOpen = searchParams.get('new') === 'true'
    setOpen(shouldOpen)
  }, [searchParams])

  const handleChange = (field: string, value: string) => {
    // Always trim spaces for name field
    const processedValue = field === 'name' ? value.trimStart() : value
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'name') {
      setNameError("")
    }
    setBackendError("")
  }

  const handleClose = () => {
    setOpen(false)
    // Remove the new parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('new')
    router.replace(url.pathname)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setBackendError("")

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create service")
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        status: ServiceStatus.OPERATIONAL
      })
      setTouched({
        name: false,
        description: false
      })

      // Close dialog and refresh page
      handleClose()
      router.refresh()
    } catch (error) {
      console.error("Error creating service:", error)
      setBackendError(error instanceof Error ? error.message : "Failed to create service")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Service Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-500">{nameError}</p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="status" className="text-sm font-medium">
              Initial Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ServiceStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {backendError && (
            <p className="text-sm text-red-500">{backendError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
