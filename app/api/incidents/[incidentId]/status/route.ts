import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { IncidentStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

interface UpdateStatusBody {
  status: IncidentStatus
}

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

    const body = await req.json() as UpdateStatusBody

    // Validate the status
    if (!body.status || !Object.values(IncidentStatus).includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid incident status" },
        { status: 400 }
      )
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
        status: body.status,
      },
      include: {
        organization: true,
        service: true,
      },
    })

    // Trigger Pusher event
    await pusherServer.trigger(
      `organization-${user.organization.id}`,
      "incident:update",
      incident
    )

    return NextResponse.json(incident)
  } catch (error) {
    console.error("[INCIDENT_STATUS_UPDATE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// Add GET method to handle static generation
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
