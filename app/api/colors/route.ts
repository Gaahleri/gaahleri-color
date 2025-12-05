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
        // 较短的缓存时间以便更快看到管理员更新
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
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
