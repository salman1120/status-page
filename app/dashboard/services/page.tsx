import { Heading } from "@/components/ui/heading"
import { ServiceForm } from "@/components/services/service-form"
import { ServiceList } from "@/components/services/service-list"
import { Separator } from "@/components/ui/separator"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function ServicesPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organization: {
        include: {
          services: true,
        },
      },
    },
  })

  if (!user?.organization) {
    redirect("/setup")
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading title="Services" description="Monitor and manage your service statuses" />
        </div>
        <ServiceForm />
      </div>
      <Separator />
      <ServiceList initialServices={user.organization.services} />
    </div>
  )
}
