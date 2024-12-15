import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { IncidentStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const incident = await prisma.incident.findUnique({
      where: { id: params.incidentId },
      include: { service: { include: { organization: { include: { users: true } } } } }
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const body = await req.json()
    const status = body.status as IncidentStatus

    const updatedIncident = await prisma.incident.update({
      where: { id: params.incidentId },
      data: { status },
      include: {
        service: true,
        updates: true
      }
    })

    return NextResponse.json(updatedIncident)
  } catch (error) {
    console.error("[INCIDENT_STATUS_UPDATE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Add GET method to handle static generation
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
