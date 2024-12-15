"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user already has an organization
    const checkOrganization = async () => {
      try {
        const response = await fetch("/api/organization", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache"
          }
        })
        const data = await response.json()
        
        if (data && !data.error && data.id) {
          // Only redirect if we actually have an organization
          window.location.href = "/dashboard"
          return
        }
      } catch (error) {
        console.error("Error checking organization:", error)
      } finally {
        setLoading(false)
      }
    }

    checkOrganization()
  }, []) // Remove router from dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setError("")
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.id) {
        // Use window.location for a hard redirect
        window.location.href = "/dashboard"
        return
      } else {
        setError(data.error || "Failed to create organization")
      }
    } catch (error) {
      console.error("Error creating organization:", error)
      setError("Failed to create organization")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="acme-corp"
                pattern="[a-zA-Z0-9-]+"
                required
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500">
                Used in URLs. Only letters, numbers, and hyphens.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
