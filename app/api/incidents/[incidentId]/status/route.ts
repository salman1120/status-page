import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { IncidentStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
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
    const { status, message } = body

    if (!status || !Object.values(IncidentStatus).includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      )
    }

    const incident = await prisma.incident.findFirst({
      where: {
        id: params.incidentId,
        organizationId: user.organization.id
      }
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    const [updatedIncident] = await prisma.$transaction([
      prisma.incident.update({
        where: { id: params.incidentId },
        data: { 
          status,
          updates: {
            create: {
              status,
              message: message || `Status updated to ${status}`
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
    ])

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
