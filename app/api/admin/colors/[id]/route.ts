import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET single color
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const color = await prisma.color.findUnique({
      where: { id },
      include: {
        series: {
          select: { id: true, name: true },
        },
      },
    });

    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error("Error fetching color:", error);
    return NextResponse.json(
      { error: "Failed to fetch color" },
      { status: 500 }
    );
  }
}

// PUT update color
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, hex, rgb, description, buyLink, badge, status, seriesId } = body;

    const color = await prisma.color.update({
      where: { id },
      data: {
        name,
        hex,
        rgb,
        description: description || null,
        buyLink: buyLink || null,
        badge: badge || null,
        status: status || null,
        seriesId,
      },
      include: {
        series: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error("Error updating color:", error);
    return NextResponse.json(
      { error: "Failed to update color" },
      { status: 500 }
    );
  }
}

// DELETE color
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.color.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Color deleted successfully" });
  } catch (error) {
    console.error("Error deleting color:", error);
    return NextResponse.json(
      { error: "Failed to delete color" },
      { status: 500 }
    );
  }
}
