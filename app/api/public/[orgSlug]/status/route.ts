import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      include: {
        services: {
          include: {
            metrics: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
            incidents: {
              where: {
                status: {
                  in: ["INVESTIGATING", "IDENTIFIED", "MONITORING"],
                },
              },
              orderBy: { createdAt: "desc" },
              include: {
                updates: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error("[PUBLIC_STATUS]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
