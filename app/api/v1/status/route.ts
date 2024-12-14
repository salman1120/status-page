import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const apiKey = searchParams.get("api_key")
    
    if (!apiKey || apiKey !== process.env.STATUS_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    })

    const incidents = await prisma.incident.findMany({
      where: {
        status: {
          not: "RESOLVED"
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        serviceId: true,
        startedAt: true,
      },
      orderBy: {
        startedAt: "desc"
      },
      take: 5
    })

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services,
      active_incidents: incidents,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
