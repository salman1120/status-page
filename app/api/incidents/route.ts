import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organization: {
          include: {
            incidents: {
              include: {
                service: true,
                updates: {
                  orderBy: { createdAt: "desc" },
                },
              },
              orderBy: { startedAt: "desc" },
            },
          },
        },
      },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json(user.organization.incidents)
  } catch (error) {
    console.error("Failed to fetch incidents:", error)
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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

    // Validate title field
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: "Title is required and cannot be empty" },
        { status: 400 }
      )
    }

    // Check for duplicate title for active incidents
    const existingIncident = await prisma.incident.findFirst({
      where: {
        organizationId: user.organization.id,
        title: {
          equals: body.title.trim(),
          mode: 'insensitive'
        },
        status: {
          not: 'RESOLVED'
        }
      }
    })

    if (existingIncident) {
      return NextResponse.json(
        { error: "An active incident with this title already exists" },
        { status: 400 }
      )
    }

    const incident = await prisma.incident.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        serviceId: body.serviceId,
        organizationId: user.organization.id,
        createdById: user.id,
        status: "INVESTIGATING",
      },
      include: {
        service: true,
        updates: true,
      },
    })

    await pusherServer.trigger("incidents", "incident-created", incident)
    return NextResponse.json(incident)
  } catch (error) {
    console.error("Failed to create incident:", error)
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 })
  }
}
