import { IncidentForm } from "@/components/incidents/incident-form"
import { IncidentList } from "@/components/incidents/incident-list"

export default function IncidentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Incidents</h1>
        <IncidentForm />
      </div>
      <IncidentList />
    </div>
  )
}
