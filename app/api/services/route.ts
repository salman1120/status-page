import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"
import { pusherServer } from "@/lib/pusher"
import { requireAdmin } from "@/lib/auth"

export const dynamic = 'force-dynamic'

interface CreateServiceBody {
  name: string
  description?: string
  status?: ServiceStatus
}

export async function GET() {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      where: {
        organizationId: orgId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(services)
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
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    try {
      await requireAdmin()
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, status } = body as CreateServiceBody

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      )
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        status: status || ServiceStatus.OPERATIONAL,
        organizationId: orgId
      }
    })

    // Notify clients about the new service
    await pusherServer.trigger(orgId, "service:created", service)

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
