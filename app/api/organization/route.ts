import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@prisma/client"

interface UpdateOrganizationBody {
  name?: string
  description?: string
}

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get auth session
    const { userId, orgId } = auth()
    console.log("Auth userId:", userId)

    if (!userId || !orgId) {
      console.log("No userId or orgId found in auth")
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Parse and validate request
    const body = await request.json()
    console.log("Request body:", body)

    if (!body?.name || !body?.slug) {
      console.log("Missing required fields:", { name: body?.name, slug: body?.slug })
      return new Response(JSON.stringify({ error: "Name and slug are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      console.log("Invalid slug format:", body.slug)
      return new Response(JSON.stringify({ 
        error: "Slug can only contain lowercase letters, numbers, and hyphens" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Create organization in Clerk
    console.log("Creating organization:", { name: body.name, slug: body.slug, userId })
    const organization = await clerkClient.organizations.createOrganization({
      name: body.name,
      slug: body.slug,
      createdBy: userId,
    })
    console.log("Organization created:", organization)

    // Add the current user as an admin
    console.log("Adding user as admin:", { userId, organizationId: organization.id })
    const membership = await clerkClient.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: userId,
      role: "admin",
    })
    console.log("User added as admin:", membership)

    // Create default services
    const defaultServices = [
      {
        name: "Website",
        description: "Main website and user interface",
        status: "OPERATIONAL",
        organizationId: organization.id
      },
      {
        name: "API",
        description: "Backend API and services",
        status: "OPERATIONAL",
        organizationId: organization.id
      },
      {
        name: "Database",
        description: "Database and data storage",
        status: "OPERATIONAL",
        organizationId: organization.id
      }
    ]

    console.log("Creating default services")
    const services = await prisma.service.createMany({
      data: defaultServices
    })
    console.log("Default services created:", services)

    return new Response(JSON.stringify({
      organization,
      services
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error("Error creating organization:", error)
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, orgId } = auth()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Update organization in Clerk
    const updatedOrg = await clerkClient.organizations.updateOrganization(orgId, {
      name: body.name,
    })

    return NextResponse.json({ success: true, data: updatedOrg })
  } catch (error) {
    console.error("[API] Error updating organization:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth()
    console.log("GET /api/organization - Auth userId:", userId)

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const user = await clerkClient.users.getUser(userId)
    console.log("User found:", {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress
    })

    return new Response(JSON.stringify({
      status: "ok",
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    console.error("Error in GET:", error)
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
