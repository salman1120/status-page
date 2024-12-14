import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, slug } = body

    // Check if organization with slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
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
        name,
        slug,
        users: {
          create: {
            clerkId: userId,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: "admin"
          }
        }
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Error creating organization:", error)
    return NextResponse.json(
      { error: "Failed to create organization" },
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
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    )
  }
}
