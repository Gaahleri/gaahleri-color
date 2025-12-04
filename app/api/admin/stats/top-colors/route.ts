import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET top 10 most added colors in the last month
export async function GET() {
  try {
    await requireAdmin();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get the most saved colors in the last month
    const topColors = await prisma.userRecord.groupBy({
      by: ["colorId"],
      _count: {
        colorId: true,
      },
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
      orderBy: {
        _count: {
          colorId: "desc",
        },
      },
      take: 10,
    });

    // Get color details for each
    const colorIds = topColors.map((tc: { colorId: string }) => tc.colorId);
    const colors = await prisma.color.findMany({
      where: {
        id: {
          in: colorIds,
        },
      },
      include: {
        series: {
          select: { name: true },
        },
      },
    });

    // Combine count with color details
    const result = topColors.map(
      (tc: { colorId: string; _count: { colorId: number } }) => {
        const color = colors.find((c: { id: string }) => c.id === tc.colorId);
        return {
          ...color,
          addCount: tc._count.colorId,
        };
      }
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
