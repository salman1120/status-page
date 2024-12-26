import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"
import { UpdateServiceRequest } from "@/types/api"
import { pusherServer } from "@/lib/pusher"

/**
 * PATCH /api/services/[serviceId]
 * Updates a service's details and status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body: UpdateServiceRequest = await req.json()

    // Validate status if provided
    if (body.status && !Object.values(ServiceStatus).includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    // Verify service exists and belongs to organization
    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        organizationId: orgId,
      },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      )
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: {
        id: params.serviceId,
      },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
      },
    })

    // Notify clients about the service update
    await pusherServer.trigger(orgId, "service:updated", updatedService)

    return NextResponse.json({ success: true, data: updatedService })
  } catch (error) {
    console.error("[SERVICE_PATCH]", error)
    return NextResponse.json(
      { success: false, error: "Failed to update service" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/services/[serviceId]
 * Deletes a service and all associated metrics and incidents
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId, orgId } = auth()
    console.log('[API] Auth check - userId:', userId, 'orgId:', orgId)
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify service exists and belongs to organization
    const service = await prisma.service.findUnique({
      where: {
        id: params.serviceId,
        organizationId: orgId,
      },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      )
    }

    // Delete all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete incident updates first
      await tx.incidentUpdate.deleteMany({
        where: {
          incident: {
            serviceId: params.serviceId,
          },
        },
      })

      // Delete incidents
      await tx.incident.deleteMany({
        where: {
          serviceId: params.serviceId,
        },
      })

      // Delete service metrics
      await tx.serviceMetric.deleteMany({
        where: {
          serviceId: params.serviceId,
        },
      })

      // Finally delete the service
      await tx.service.delete({
        where: {
          id: params.serviceId,
        },
      })
    })

    // Notify clients about the service deletion
    await pusherServer.trigger(orgId, "service:deleted", params.serviceId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SERVICE_DELETE]", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete service" },
      { status: 500 }
    )
  }
}
