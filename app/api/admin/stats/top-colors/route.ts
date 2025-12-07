import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET top 10 most added colors for selected month
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    // Default to current year and month
    const now = new Date();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;

    // Calculate date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (country && country !== "all") {
      whereClause.user = {
        country: country,
      };
    }

    // Get the most saved colors in the last month
    const topColors = await prisma.userRecord.groupBy({
      by: ["colorId"],
      _count: {
        colorId: true,
      },
      where: whereClause,
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

    // Get available countries from User table
    const countriesResult = await prisma.user.groupBy({
      by: ["country"],
      where: {
        country: { not: null },
      },
    });
    const countries = countriesResult
      .map((c) => c.country)
      .filter(Boolean)
      .sort();

    return NextResponse.json({
      topColors: result,
      availableCountries: countries,
    }, {
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
