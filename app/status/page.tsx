import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const MOCK_SERVICES = [
  { 
    name: "Website", 
    status: "Operational", 
    color: "green" 
  },
  { 
    name: "API", 
    status: "Degraded Performance", 
    color: "yellow" 
  },
  { 
    name: "Database", 
    status: "Operational", 
    color: "green" 
  }
]

export default function PublicStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        System Status
      </h1>
      
      <div className="max-w-2xl mx-auto space-y-4">
        {MOCK_SERVICES.map((service) => (
          <Card key={service.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{service.name}</CardTitle>
              <Badge 
                variant={
                  service.status === "Operational" ? "default" : 
                  service.status === "Degraded Performance" ? "warning" : 
                  "destructive"
                }
              >
                {service.status}
              </Badge>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
