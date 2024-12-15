import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

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
    const { title, description, status, serviceId } = body

    // Create the incident
    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        status,
        serviceId,
        organizationId: user.organization.id,
      },
      include: {
        organization: true,
      },
    })

    // Trigger Pusher event
    await pusherServer.trigger(
      `organization-${user.organization.id}`,
      "incident:create",
      incident
    )

    return NextResponse.json(incident)
  } catch (error) {
    console.error("[INCIDENT_CREATE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
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

    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: user.organization.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        service: true,
      },
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
