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

    // Update the incident and create update in a transaction
    const updatedIncident = await prisma.$transaction(async (tx) => {
      // Update incident status
      const incident = await tx.incident.update({
        where: {
          id: params.incidentId,
        },
        data: {
          status: status as IncidentStatus,
          resolvedAt: status === IncidentStatus.RESOLVED ? new Date() : null,
        },
      })

      // Create the status update
      await tx.incidentUpdate.create({
        data: {
          message: `Status changed to ${status.toLowerCase()}`,
          incidentId: params.incidentId,
        },
      })

      return tx.incident.findUnique({
        where: { id: params.incidentId },
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
            take: 5,
            select: {
              id: true,
              message: true,
              createdAt: true,
            },
          },
        },
      })
    })

    // Send minimal data through Pusher
    const pusherData = {
      id: updatedIncident.id,
      title: updatedIncident.title,
      description: updatedIncident.description,
      status: updatedIncident.status,
      startedAt: updatedIncident.startedAt,
      resolvedAt: updatedIncident.resolvedAt,
      service: updatedIncident.service,
      updates: updatedIncident.updates,
    }

    await pusherServer.trigger("incidents", "incident-updated", pusherData)
    return NextResponse.json(updatedIncident)
  } catch (error) {
    console.error("Failed to update incident status:", error)
    return NextResponse.json(
      { error: "Failed to update incident status" },
      { status: 500 }
    )
  }
}
