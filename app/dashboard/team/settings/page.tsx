"use client"

import { useOrganization, OrganizationProfile } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Heading } from "../../../../components/ui/heading"
import { Separator } from "../../../../components/ui/separator"
import { Card, CardContent } from "../../../../components/ui/card"
import { Loader2 } from "lucide-react"

export default function TeamSettingsPage() {
  const { organization, isLoaded } = useOrganization()

  if (!isLoaded) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!organization) {
    redirect("/dashboard/team")
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Team Settings"
          description="Manage your organization members and roles"
        />
      </div>
      <Separator />
      <Card>
        <CardContent className="p-0">
          <OrganizationProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0",
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
