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
    const { userId } = auth()
    if (!userId) {
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organization: {
          include: {
            services: {
              where: {
                id: params.serviceId
              }
            }
          }
        }
      }
    })

    if (!user?.organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      )
    }

    if (user.organization.services.length === 0) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      )
    }

    const updatedService = await prisma.service.update({
      where: {
        id: params.serviceId,
        organizationId: user.organization.id,
      },
      data: body,
    })

    // Notify clients about the service update
    await pusherServer.trigger("services", "service-updated", updatedService)

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
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organization: {
          include: {
            services: {
              where: {
                id: params.serviceId
              }
            }
          }
        }
      }
    })

    if (!user?.organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      )
    }

    if (user.organization.services.length === 0) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      )
    }

    // Delete in transaction to ensure all related records are deleted
    await prisma.$transaction(async (tx) => {
      // First delete all incident updates for incidents related to this service
      await tx.incidentUpdate.deleteMany({
        where: {
          incident: {
            serviceId: params.serviceId
          }
        }
      })

      // Then delete all incidents related to this service
      await tx.incident.deleteMany({
        where: {
          serviceId: params.serviceId
        }
      })

      // Delete all service metrics
      await tx.serviceMetric.deleteMany({
        where: {
          serviceId: params.serviceId
        }
      })

      // Finally delete the service
      await tx.service.delete({
        where: {
          id: params.serviceId,
          organizationId: user.organization.id
        }
      })
    })

    // Notify clients about the service deletion
    await pusherServer.trigger("services", "service-deleted", params.serviceId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SERVICE_DELETE]", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete service" },
      { status: 500 }
    )
  }
}
