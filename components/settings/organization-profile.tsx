"use client"

import { useState } from "react"
import { Organization } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { X } from "lucide-react"

interface OrganizationProfileProps {
  organization: Organization
}

export function OrganizationProfile({ organization }: OrganizationProfileProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(organization.name)
  const [nameError, setNameError] = useState("")
  const [touched, setTouched] = useState(false)

  const handleChange = (value: string) => {
    // Always trim spaces for name
    setName(value.trimStart())
    setTouched(true)
    setNameError("")
  }

  const handleBlur = (value: string) => {
    if (!touched) return

    const trimmedValue = value.trim()
    if (trimmedValue === '') {
      setNameError("Organization name is required")
      setName('')
    } else {
      setName(trimmedValue)
    }
  }

  const handleReset = () => {
    setName('')
    setTouched(true)
    setNameError("")
  }

  const isFormValid = name.trim() !== '' && name.trim() !== organization.name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    // Client-side validation
    if (!name.trim()) {
      setNameError("Organization name is required")
      return
    }

    // No changes made
    if (name.trim() === organization.name) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/organization`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update organization")
      }

      toast.success("Organization updated successfully")
    } catch (error) {
      console.error("Failed to update organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update organization")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Profile</CardTitle>
        <CardDescription>
          Update your organization details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              Organization Name
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={(e) => handleBlur(e.target.value)}
                disabled={loading}
                required
              />
              {name && name !== organization.name && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {touched && nameError && (
              <p className="text-sm text-red-500 mt-1">
                {nameError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              value={organization.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              This is your unique identifier used in your status page URL
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={loading || !isFormValid}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
