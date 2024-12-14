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

  useEffect(() => {
    // Check if user already has an organization
    const checkOrganization = async () => {
      try {
        const response = await fetch("/api/organization")
        const data = await response.json()
        
        if (data && !data.error) {
          // If organization exists, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking organization:", error)
      } finally {
        setLoading(false)
      }
    }

    checkOrganization()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create organization")
      }
    } catch (error) {
      console.error("Error creating organization:", error)
      alert("Failed to create organization")
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
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
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
              />
              <p className="text-sm text-gray-500">
                Used in URLs. Only letters, numbers, and hyphens.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Create Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
