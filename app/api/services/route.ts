import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"

export const dynamic = 'force-dynamic'

interface CreateServiceBody {
  name: string
  description?: string
  status?: ServiceStatus
}

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
            services: true,
          },
        },
      },
    })

    if (!user?.organization) {
      return NextResponse.json([])
    }

    return NextResponse.json(user.organization.services)
  } catch (error) {
    console.error("[SERVICES_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json() as CreateServiceBody

    // Validate name field
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: "Name is required and cannot be empty" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organization: {
          include: {
            services: true
          }
        },
      },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Check for duplicate service name
    const existingService = user.organization.services.find(
      service => service.name.toLowerCase() === body.name.trim().toLowerCase()
    )
    if (existingService) {
      return NextResponse.json(
        { error: "A service with this name already exists" },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (body.status && !Object.values(ServiceStatus).includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid service status" },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || '',
        status: body.status || ServiceStatus.OPERATIONAL,
        organization: {
          connect: {
            id: user.organization.id
          }
        }
      },
    })

    // Trigger Pusher event
    await pusherServer.trigger(
      `organization-${user.organization.id}`,
      "service:create",
      service
    )

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
