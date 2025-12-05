import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET all colors
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get("seriesId");

    const colors = await prisma.color.findMany({
      where: seriesId ? { seriesId } : undefined,
      include: {
        series: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(colors, {
      headers: {
        // 禁用缓存以确保数据实时更新
        "Cache-Control": "no-store, no-cache, must-revalidate",
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

// POST create new color
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      name,
      hex,
      rgb,
      description,
      buyLink,
      badge,
      badgeColor,
      status,
      statusColor,
      seriesId,
    } = body;

    if (!name || !hex || !rgb || !seriesId) {
      return NextResponse.json(
        { error: "Name, hex, rgb, and seriesId are required" },
        { status: 400 }
      );
    }

    const color = await prisma.color.create({
      data: {
        name,
        hex,
        rgb,
        description: description || null,
        buyLink: buyLink || null,
        badge: badge || null,
        badgeColor: badgeColor || null,
        status: status || null,
        statusColor: statusColor || null,
        seriesId,
      },
      include: {
        series: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error("Error creating color:", error);
    return NextResponse.json(
      { error: "Failed to create color" },
      { status: 500 }
    );
  }
}

