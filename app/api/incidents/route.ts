import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        service: true,
        updates: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { startedAt: "desc" },
    })
    return NextResponse.json(incidents)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const incident = await prisma.incident.create({
      data: {
        ...body,
        createdById: userId,
      },
      include: {
        service: true,
        updates: true,
      },
    })

    await pusherServer.trigger("incidents", "incident-created", incident)
    return NextResponse.json(incident)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 })
  }
}
