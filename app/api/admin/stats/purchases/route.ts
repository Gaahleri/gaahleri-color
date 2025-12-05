import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats/purchases - Get purchase click statistics by month
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString()
    );

    const country = searchParams.get("country");

    // Calculate date range for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (country && country !== "all") {
      whereClause.country = country;
    }

    // Get aggregated purchase clicks for the month grouped by color
    const purchaseStats = await prisma.purchaseClick.groupBy({
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
    });

    // Get color details for each
    const colorIds = purchaseStats.map((ps) => ps.colorId);
    const colors = await prisma.color.findMany({
      where: {
        id: {
          in: colorIds,
        },
      },
      include: {
        series: {
          select: { id: true, name: true },
        },
      },
    });

    // Combine count with color details
    const result = purchaseStats.map((ps) => {
      const color = colors.find((c) => c.id === ps.colorId);
      return {
        colorId: ps.colorId,
        colorName: color?.name || "Unknown",
        colorCode: color?.name || "Unknown", // Using name as code if no separate code field
        hex: color?.hex || "#000000",
        rgb: color?.rgb || "0,0,0",
        seriesId: color?.series.id || "",
        seriesName: color?.series.name || "Unknown",
        clickCount: ps._count.colorId,
      };
    });

    // Get total clicks for the month
    const totalClicks = purchaseStats.reduce(
      (sum, ps) => sum + ps._count.colorId,
      0
    );

    // Get available months with data for the dropdown
    const availableMonths = await prisma.purchaseClick.groupBy({
      by: ["createdAt"],
      _count: true,
    });

    // Extract unique year-month combinations
    const monthsSet = new Set<string>();
    availableMonths.forEach((am) => {
      const date = new Date(am.createdAt);
      monthsSet.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
    });
    const months = Array.from(monthsSet).sort().reverse();

    // Get available countries
    const countriesResult = await prisma.purchaseClick.groupBy({
      by: ["country"],
      where: {
        country: { not: null },
      },
    });
    const countries = countriesResult
      .map((c) => c.country)
      .filter(Boolean)
      .sort();

    return NextResponse.json(
      {
        year,
        month,
        totalClicks,
        colors: result,
        availableMonths: months,
        availableCountries: countries,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching purchase stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase statistics" },
      { status: 500 }
    );
  }
}
