import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
      include: {
        metrics: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICE_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    await prisma.service.delete({
      where: { id: params.serviceId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SERVICE_DELETE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, status } = body

    if (!name && !description && !status) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      )
    }

    if (status && !Object.values(ServiceStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid service status" },
        { status: 400 }
      )
    }

    const service = await prisma.service.update({
      where: { id: params.serviceId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
      },
      include: {
        metrics: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICE_UPDATE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
