import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all series (public - for filters)
// Enable caching for better performance
export async function GET() {
  try {
    const series = await prisma.series.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    });
    
    return NextResponse.json(series, {
      headers: {
        // Cache for 5 minutes on the client, revalidate every 60 seconds on the server
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}
