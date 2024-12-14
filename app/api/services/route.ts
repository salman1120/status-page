import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const service = await prisma.service.create({
      data: {
        ...body,
        organizationId: orgId,
      },
    })

    await pusherServer.trigger("services", "service-created", service)
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
