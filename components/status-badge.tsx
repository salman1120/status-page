import { Badge } from "@/components/ui/badge"
import { ServiceStatus } from "@prisma/client"

const statusConfig: Record<ServiceStatus, { label: string; className: string }> = {
  OPERATIONAL: {
    label: "Operational",
    className: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
  },
  DEGRADED_PERFORMANCE: {
    label: "Degraded",
    className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
  },
  PARTIAL_OUTAGE: {
    label: "Partial Outage",
    className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
  },
  MAJOR_OUTAGE: {
    label: "Major Outage",
    className: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
  }
}

interface StatusBadgeProps {
  status: ServiceStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Default to OPERATIONAL if status is undefined
  const config = statusConfig[status] || statusConfig.OPERATIONAL
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
