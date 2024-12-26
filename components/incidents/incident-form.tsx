"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IncidentStatus, Service } from "@prisma/client"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface IncidentFormProps {
  services: Service[]
}

export function IncidentForm({ services }: IncidentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [backendError, setBackendError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    service: ""
  })
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    service: false
  })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceId: "",
    status: IncidentStatus.INVESTIGATING
  })

  // Watch for URL parameter changes
  useEffect(() => {
    const shouldOpen = searchParams.get('open') === 'true'
    setOpen(shouldOpen)
  }, [searchParams])

  const handleChange = (field: string, value: string) => {
    // Always trim spaces for title field
    const processedValue = field === 'title' ? value.trimStart() : value
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Clear field-specific error
    setFieldErrors(prev => ({ ...prev, [field]: "" }))
    setBackendError("")
  }

  const handleServiceChange = (value: string) => {
    handleChange("serviceId", value)
    setFieldErrors(prev => ({ ...prev, service: "" }))
  }

  const handleBlur = (field: string, value: string) => {
    if (!touched[field as keyof typeof touched]) return

    if (field === 'title') {
      const trimmedValue = value.trim()
      if (trimmedValue === '') {
        setFieldErrors(prev => ({ ...prev, title: "Title is required" }))
        setFormData(prev => ({ ...prev, title: '' }))
      } else {
        setFormData(prev => ({ ...prev, title: trimmedValue }))
      }
    } else if (field === 'description') {
      const trimmedValue = value.trim()
      setFormData(prev => ({ ...prev, description: trimmedValue }))
    }
  }

  const handleReset = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }))
    setTouched(prev => ({ ...prev, [field]: true }))
    setFieldErrors(prev => ({ ...prev, [field]: "" }))
    setBackendError("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Clear the URL parameter when closing
      router.push('/dashboard/incidents')
      // Reset form state
      setFormData({
        title: "",
        description: "",
        serviceId: "",
        status: IncidentStatus.INVESTIGATING
      })
      setTouched({
        title: false,
        description: false,
        service: false
      })
      setFieldErrors({
        title: "",
        service: ""
      })
      setBackendError("")
    }
  }

  const isFormValid = formData.title.trim() !== '' && formData.serviceId !== ''

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setBackendError("")

    // Set all fields as touched on submit
    setTouched({
      title: true,
      description: true,
      service: true
    })

    // Client-side validation
    const errors: { title?: string; service?: string } = {}
    
    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }
    
    if (!formData.serviceId) {
      errors.service = "Service selection is required"
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors({ ...fieldErrors, ...errors })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim()
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create incident")
      }

      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating incident:", error)
      setBackendError(error instanceof Error ? error.message : "Failed to create incident. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Create Incident</Button>
      </DialogTrigger>
      <DialogContent className="min-h-[450px] max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {backendError && (
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">
              {backendError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium flex items-center gap-1">
              Title
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="title"
                name="title"
                placeholder="Enter incident title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={(e) => handleBlur("title", e.target.value)}
                disabled={loading}
                required
              />
              {formData.title && (
                <button
                  type="button"
                  onClick={() => handleReset("title")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {touched.title && fieldErrors.title && (
              <p className="text-sm text-red-500 mt-1">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="service" className="text-sm font-medium flex items-center gap-1">
              Service
              <span className="text-red-500">*</span>
            </label>
            <Select
              name="service"
              value={formData.serviceId}
              onValueChange={handleServiceChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(touched.service || fieldErrors.service) && fieldErrors.service && (
              <p className="text-sm text-red-500 mt-1">
                {fieldErrors.service}
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
                placeholder="Enter incident description"
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
              onValueChange={(value) => handleChange("status", value as IncidentStatus)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IncidentStatus.INVESTIGATING}>
                  Investigating
                </SelectItem>
                <SelectItem value={IncidentStatus.IDENTIFIED}>
                  Identified
                </SelectItem>
                <SelectItem value={IncidentStatus.MONITORING}>
                  Monitoring
                </SelectItem>
                <SelectItem value={IncidentStatus.RESOLVED}>
                  Resolved
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isFormValid}
          >
            {loading ? "Creating..." : "Create Incident"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
