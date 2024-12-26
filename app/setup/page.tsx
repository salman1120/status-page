"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useOrganization, useUser, useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const { user } = useUser()
  const { getToken } = useAuth()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if user already has an organization
  useEffect(() => {
    if (organization) {
      router.replace("/organizations")
    }
  }, [organization, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || !user) {
      return
    }
    
    setIsSubmitting(true)
    setError("")

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create organization")
      }

      router.replace("/organizations")
    } catch (error) {
      console.error("Error creating organization:", error)
      setError(error instanceof Error ? error.message : "Failed to create organization")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking organization
  if (organization === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  // If user has organization, they shouldn't see this page
  if (organization) {
    return null
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-sm text-muted-foreground">
            Signed in as: {user?.primaryEmailAddress?.emailAddress}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your organization name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">
                Organization Slug
                <span className="text-sm text-muted-foreground ml-1">
                  (used in your status page URL)
                </span>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="your-org-name"
                required
                pattern="[a-z0-9-]+"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Only lowercase letters, numbers, and hyphens are allowed
              </p>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !name || !slug}
            >
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
