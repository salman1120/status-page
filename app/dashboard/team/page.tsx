import { auth, clerkClient } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizationProfile } from "@clerk/nextjs"

export default async function TeamPage() {
  const { userId, orgId } = auth()
  
  if (!userId || !orgId) {
    redirect("/sign-in")
  }

  const organization = await clerkClient.organizations.getOrganization({ organizationId: orgId })

  if (!organization) {
    redirect("/setup")
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Team Settings"
          description={`Manage team members for ${organization.name}`}
        />
      </div>
      <Separator />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
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
    </div>
  )
}
