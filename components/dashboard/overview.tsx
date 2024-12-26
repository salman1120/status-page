import { Service } from "@prisma/client"
import { Activity, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"

interface OverviewProps {
  services: Service[]
}

export function Overview({ services }: OverviewProps) {
  const operationalServices = services.filter(service => service.status === "OPERATIONAL")
  const disruptedServices = services.filter(service => service.status !== "OPERATIONAL")
  const systemStatus = disruptedServices.length > 0 ? "disrupted" : "operational"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <StatusBadge status={systemStatus} size="lg" />
          <p className="text-xs text-muted-foreground mt-2">
            {disruptedServices.length === 0
              ? "All systems operational"
              : `${disruptedServices.length} service${disruptedServices.length === 1 ? "" : "s"} disrupted`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{services.length}</div>
          <p className="text-xs text-muted-foreground">
            Services being monitored
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Operational</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{operationalServices.length}</div>
          <p className="text-xs text-muted-foreground">
            Services running normally
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disrupted</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{disruptedServices.length}</div>
          <p className="text-xs text-muted-foreground">
            Services with issues
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
