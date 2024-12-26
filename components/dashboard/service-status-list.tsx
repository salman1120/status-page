import { Service } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"

interface ServiceStatusListProps extends React.HTMLAttributes<HTMLDivElement> {
  services: Service[]
}

export function ServiceStatusList({ services, className, ...props }: ServiceStatusListProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {service.name}
                </p>
                {service.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </div>
              <StatusBadge status={service.status.toLowerCase()} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
