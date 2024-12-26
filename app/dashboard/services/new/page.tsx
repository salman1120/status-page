import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { ServiceForm } from "@/components/services/service-form"

export default async function NewServicePage() {
  const { userId, orgId } = auth()
  
  if (!userId || !orgId) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Service</h1>
        <ServiceForm />
      </div>
    </div>
  )
}
