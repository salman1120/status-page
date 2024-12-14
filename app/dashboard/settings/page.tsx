import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusPageUrl } from "@/components/settings/status-page-url"
import { OrganizationProfile } from "@/components/settings/organization-profile"

export default async function SettingsPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organization: true,
    },
  })

  if (!user?.organization) {
    redirect("/setup")
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Settings"
          description="Manage your organization and status page settings"
        />
      </div>
      <Separator />
      <div className="grid gap-6">
        <OrganizationProfile organization={user.organization} />
        <StatusPageUrl organization={user.organization} />
      </div>
    </div>
  )
}
