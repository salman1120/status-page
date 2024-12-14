import { Badge } from "@/components/ui/badge"
import { ServiceStatus } from "@prisma/client"

const statusConfig = {
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
  }
}

interface StatusBadgeProps {
  status: ServiceStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
