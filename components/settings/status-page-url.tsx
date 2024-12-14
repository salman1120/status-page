"use client"

import { useState } from "react"
import { Organization } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

interface StatusPageUrlProps {
  organization: Organization
}

export function StatusPageUrl({ organization }: StatusPageUrlProps) {
  const [copied, setCopied] = useState(false)

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
          Your public status page URL where customers can view your service status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Status Page URL</Label>
          <div className="flex items-center gap-2">
            <Input
              value={statusPageUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this URL with your customers to let them view your service status
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
