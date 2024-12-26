"use client"

import { useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

export function StatusPageUrl() {
  const { organization, isLoaded } = useOrganization()
  const [copied, setCopied] = useState(false)

  if (!isLoaded || !organization) {
    return null
  }

  // Get the base URL, fallback to window.location.origin in client
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || ''
  
  const statusPageUrl = `${baseUrl}/status/${organization.slug}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(statusPageUrl)
      setCopied(true)
      toast.success("URL copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy URL")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Status Page</CardTitle>
        <CardDescription>
          Share this URL with your users to let them view your service status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="url">Status Page URL</Label>
          <div className="flex space-x-2">
            <Input
              id="url"
              value={statusPageUrl}
              readOnly
              className="bg-muted"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
