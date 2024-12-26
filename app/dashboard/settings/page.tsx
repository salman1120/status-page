import { Heading } from "@/components/ui/heading"
import { OrganizationForm } from "@/components/settings/organization-form"
import { Separator } from "@/components/ui/separator"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const { userId, orgId } = auth()
  
  if (!userId || !orgId) {
    redirect("/sign-in")
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <Heading title="Settings" description="Manage your organization settings" />
      </div>
      <Separator />
      <OrganizationForm initialServices={[]} />
    </div>
  )
}
