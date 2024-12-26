import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface CreateUpdateBody {
  message: string
}

export async function POST(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { message } = body as CreateUpdateBody

    // Validate message
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check if incident exists and belongs to organization
    const incident = await prisma.incident.findUnique({
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

    // Create incident update
    const update = await prisma.incidentUpdate.create({
      data: {
        message: message.trim(),
        incidentId: params.incidentId,
        createdById: userId
      }
    })

    return NextResponse.json({ success: true, update })
  } catch (error) {
    console.error("[INCIDENT_UPDATE_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if incident exists and belongs to organization
    const incident = await prisma.incident.findUnique({
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

    // Get incident updates
    const updates = await prisma.incidentUpdate.findMany({
      where: {
        incidentId: params.incidentId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ success: true, updates })
  } catch (error) {
    console.error("[INCIDENT_UPDATE_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
