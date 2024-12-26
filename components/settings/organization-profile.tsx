"use client"

import { useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { useAdmin } from "@/hooks/use-admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { X } from "lucide-react"

export function OrganizationProfile() {
  const { organization, isLoaded } = useOrganization()
  const isAdmin = useAdmin()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(organization?.name || "")
  const [nameError, setNameError] = useState("")
  const [touched, setTouched] = useState(false)

  if (!isLoaded || !organization || !isAdmin) {
    return null
  }

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
    setName(organization.name)
    setTouched(false)
    setNameError("")
  }

  const isFormValid = name.trim() !== '' && name.trim() !== organization.name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const trimmedName = name.trim()
    if (trimmedName === '') {
      setNameError("Organization name is required")
      return
    }

    if (name.trim() === organization.name) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/organization`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
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
            <div className="space-y-1">
              <Label htmlFor="name">Organization Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={(e) => handleBlur(e.target.value)}
                  placeholder="Enter organization name"
                  className={nameError ? "border-red-500" : ""}
                />
                {name && name !== organization.name && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {nameError && (
                <p className="text-sm text-red-500">{nameError}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                value={organization.slug || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <Button type="submit" disabled={!isFormValid || loading}>
            {loading ? "Updating..." : "Update Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
