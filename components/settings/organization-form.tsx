"use client"

import { useRouter } from "next/navigation"
import { useOrganization } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"

interface OrganizationFormProps {
  initialServices: Service[]
}

export function OrganizationForm({ initialServices }: OrganizationFormProps) {
  const router = useRouter()
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: organization?.name || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/organization", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update organization")
      }

      toast.success("Organization settings updated")
      router.refresh()
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update organization")
    } finally {
      setLoading(false)
    }
  }

  const statusPageUrl = `${window.location.origin}/status/${organization?.slug}`

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Update your organization details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Organization Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="slug" className="text-sm font-medium">
                Organization Slug
              </label>
              <Input
                id="slug"
                value={organization?.slug}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This is your unique organization identifier and cannot be changed
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization URL</CardTitle>
          <CardDescription>Your organization's public URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={statusPageUrl} readOnly className="bg-muted" />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(statusPageUrl)
                toast.success("URL copied to clipboard")
              }}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
