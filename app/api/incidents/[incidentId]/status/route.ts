import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { IncidentStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status } = body

    // Validate the status
    if (!Object.values(IncidentStatus).includes(status as IncidentStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // First check if the incident exists and belongs to the organization
    const existingIncident = await prisma.incident.findFirst({
      where: {
        id: params.incidentId,
        organizationId: user.organization.id,
      },
    })

    if (!existingIncident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Update the incident
    const incident = await prisma.incident.update({
      where: {
        id: params.incidentId,
      },
      data: {
        status: status as IncidentStatus,
        resolvedAt: status === IncidentStatus.RESOLVED ? new Date() : null,
        updates: {
          create: {
            message: `Status changed to ${status.toLowerCase()}`,
          },
        },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        updates: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Only get the latest 5 updates
          select: {
            id: true,
            message: true,
            createdAt: true,
          },
        },
      },
    })

    // Send minimal data through Pusher
    const pusherData = {
      id: incident.id,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      startedAt: incident.startedAt,
      resolvedAt: incident.resolvedAt,
      service: incident.service,
      updates: incident.updates,
    }

    await pusherServer.trigger("incidents", "incident-updated", pusherData)
    return NextResponse.json(incident)
  } catch (error) {
    console.error("Failed to update incident status:", error)
    return NextResponse.json(
      { error: "Failed to update incident status" },
      { status: 500 }
    )
  }
}
