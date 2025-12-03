import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET all series
export async function GET() {
  try {
    const series = await prisma.series.findMany({
      include: {
        _count: {
          select: { colors: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

// POST create new series
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { name, slug, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const series = await prisma.series.create({
      data: {
        name,
        slug: slug || null,
        description: description || null,
      },
    });

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error("Error creating series:", error);
    return NextResponse.json(
      { error: "Failed to create series" },
      { status: 500 }
    );
  }
}
