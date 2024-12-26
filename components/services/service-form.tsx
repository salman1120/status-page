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
    const shouldOpen = searchParams.get('open') === 'true'
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

  const handleBlur = (field: string, value: string) => {
    if (!touched[field as keyof typeof touched]) return

    if (field === 'name') {
      const trimmedValue = value.trim()
      if (trimmedValue === '') {
        setNameError("Service name is required")
        setFormData(prev => ({ ...prev, name: '' }))
      } else {
        setFormData(prev => ({ ...prev, name: trimmedValue }))
      }
    } else if (field === 'description') {
      const trimmedValue = value.trim()
      setFormData(prev => ({ ...prev, description: trimmedValue }))
    }
  }

  const handleReset = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }))
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'name') {
      setNameError("")
    }
    setBackendError("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Clear the URL parameter when closing
      router.push('/dashboard/services')
      // Reset form state
      setFormData({
        name: "",
        description: "",
        status: ServiceStatus.OPERATIONAL
      })
      setTouched({
        name: false,
        description: false
      })
      setNameError("")
      setBackendError("")
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setBackendError("")

    // Set all fields as touched on submit
    setTouched({
      name: true,
      description: true
    })

    // Client-side validation
    if (!formData.name.trim()) {
      setNameError("Service name is required")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim()
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create service")
      }

      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating service:", error)
      setBackendError(error instanceof Error ? error.message : "Failed to create service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.name.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Create Service</Button>
      </DialogTrigger>
      <DialogContent className="min-h-[450px] max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {backendError && (
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">
              {backendError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
              Service Name
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={(e) => handleBlur("name", e.target.value)}
                disabled={loading}
                required
              />
              {formData.name && (
                <button
                  type="button"
                  onClick={() => handleReset("name")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {touched.name && nameError && (
              <p className="text-sm text-red-500 mt-1">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <div className="relative">
              <Textarea
                id="description"
                name="description"
                placeholder="Enter service description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={(e) => handleBlur("description", e.target.value)}
                disabled={loading}
              />
              {formData.description && (
                <button
                  type="button"
                  onClick={() => handleReset("description")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ServiceStatus.OPERATIONAL}>
                  Operational
                </SelectItem>
                <SelectItem value={ServiceStatus.DEGRADED_PERFORMANCE}>
                  Degraded Performance
                </SelectItem>
                <SelectItem value={ServiceStatus.PARTIAL_OUTAGE}>
                  Partial Outage
                </SelectItem>
                <SelectItem value={ServiceStatus.MAJOR_OUTAGE}>
                  Major Outage
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isFormValid}
          >
            {loading ? "Creating..." : "Create Service"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
