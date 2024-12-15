import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

interface CreateOrganizationBody {
  name: string
  slug: string
}

interface UpdateOrganizationBody {
  name: string
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json() as CreateOrganizationBody

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      )
    }

    // Check if organization with slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: body.slug }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization with this slug already exists" },
        { status: 400 }
      )
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: body.name,
        slug: body.slug,
        users: {
          create: {
            clerkId: userId,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: "admin"
          }
        }
      },
      include: {
        users: true
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("[ORGANIZATION_CREATE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organization = await prisma.organization.findFirst({
      where: {
        users: {
          some: {
            clerkId: userId
          }
        }
      },
      include: {
        users: true,
        services: true
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
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

    const body = await req.json() as UpdateOrganizationBody

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.update({
      where: {
        id: user.organization.id,
      },
      data: {
        name: body.name,
      },
      include: {
        users: true,
        services: true
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("[ORGANIZATION_UPDATE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
