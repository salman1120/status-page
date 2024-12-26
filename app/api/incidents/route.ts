import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { IncidentStatus } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"

export const dynamic = 'force-dynamic'

interface CreateIncidentBody {
  title: string
  description: string
  serviceId: string
  status?: IncidentStatus
}

export async function GET() {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: orgId
      },
      include: {
        service: true,
        updates: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error("[INCIDENTS_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, serviceId, status } = body as CreateIncidentBody

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Incident title is required" },
        { status: 400 }
      )
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Incident description is required" },
        { status: 400 }
      )
    }

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      )
    }

    // Verify service belongs to organization
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: orgId
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    // Create incident
    const incident = await prisma.incident.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: status || IncidentStatus.INVESTIGATING,
        serviceId,
        organizationId: orgId,
        createdById: userId,
        updates: {
          create: {
            message: description.trim(),
            createdById: userId
          }
        }
      },
      include: {
        service: true,
        updates: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Notify clients about the new incident
    await pusherServer.trigger(orgId, "incident:created", incident)

    return NextResponse.json(incident)
  } catch (error) {
    console.error("[INCIDENTS_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
