import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { IncidentStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json([])
    }

    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: user.organization.id
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error("[INCIDENTS_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
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
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, serviceId, status = IncidentStatus.INVESTIGATING } = body

    if (!title || !serviceId) {
      return NextResponse.json(
        { error: "Title and serviceId are required" },
        { status: 400 }
      )
    }

    // Verify service belongs to organization
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: user.organization.id
      }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        status,
        organization: {
          connect: { id: user.organization.id }
        },
        service: {
          connect: { id: serviceId }
        },
        updates: {
          create: {
            message: description || "Incident created",
            status
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

    return NextResponse.json(incident)
  } catch (error) {
    console.error("[INCIDENTS_POST]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
