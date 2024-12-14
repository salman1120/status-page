import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UptimeChart } from '@/components/metrics/uptime-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ServicePage({
  params,
}: {
  params: { serviceId: string }
}) {
  const { orgId } = auth()
  if (!orgId) {
    redirect('/select-org')
  }

  const service = await prisma.service.findUnique({
    where: {
      id: params.serviceId,
      organizationId: orgId,
    },
    include: {
      metrics: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      },
      incidents: {
        orderBy: {
          startedAt: 'desc',
        },
        take: 5,
      },
    },
  })

  if (!service) {
    redirect('/dashboard/services')
  }

  const currentUptime = service.metrics[0]?.uptime ?? 100
  const averageLatency =
    service.metrics.reduce((acc, curr) => acc + (curr.latency ?? 0), 0) /
    service.metrics.length

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{service.name}</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {service.updatedAt.toLocaleString()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.status}</div>
            <div className="text-sm text-muted-foreground">
              Current Uptime: {currentUptime.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageLatency.toFixed(0)}ms
            </div>
            <div className="text-sm text-muted-foreground">
              Average Response Time
            </div>
          </CardContent>
        </Card>
      </div>

      <UptimeChart
        data={service.metrics.map(m => ({
          timestamp: m.timestamp.toISOString(),
          uptime: m.uptime,
        }))}
        serviceName={service.name}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {service.incidents.length > 0 ? (
            <ul className="space-y-4">
              {service.incidents.map(incident => (
                <li key={incident.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{incident.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {incident.startedAt.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm">{incident.status}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">
              No recent incidents
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
