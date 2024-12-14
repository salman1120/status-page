import { Button } from "@/components/ui/button"
import { ServiceForm } from "@/components/services/service-form"
import { ServiceList } from "@/components/services/service-list"

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <ServiceForm />
      </div>
      <ServiceList />
    </div>
  )
}
