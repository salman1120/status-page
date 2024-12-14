import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
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
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, status } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organization: true,
      },
    })

    if (!user?.organization) {
      return new NextResponse("Organization not found", { status: 404 })
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        status: status || ServiceStatus.OPERATIONAL,
        organizationId: user.organization.id,
      },
    })

    // Notify clients about the new service
    await pusherServer.trigger("services", "service-created", service)

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
