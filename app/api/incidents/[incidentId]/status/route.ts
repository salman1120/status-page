import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { IncidentStatus } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"

interface UpdateIncidentStatusBody {
  status: IncidentStatus
  message?: string
}

export async function PATCH(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, message } = body as UpdateIncidentStatusBody

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    // Verify incident exists and belongs to organization
    const incident = await prisma.incident.findFirst({
      where: {
        id: params.incidentId,
        organizationId: orgId
      }
    })

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      )
    }

    // Update incident status and add update message if provided
    const data: any = {
      status
    }

    if (message?.trim()) {
      data.updates = {
        create: {
          message: message.trim(),
          createdById: userId
        }
      }
    }

    // Update incident status
    const updatedIncident = await prisma.incident.update({
      where: {
        id: params.incidentId
      },
      data,
      include: {
        service: true,
        updates: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    // Notify clients about the incident update
    await pusherServer.trigger(orgId, "incident-status:updated", updatedIncident)

    return NextResponse.json({ success: true, incident: updatedIncident })
  } catch (error) {
    console.error("[INCIDENT_STATUS_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
