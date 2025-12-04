import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all colors (public - for color picker)
export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      include: {
        series: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ series: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json(colors, {
      headers: {
        // Cache for 5 minutes on the client, revalidate every 30 seconds on the server
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json(
      { error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}
