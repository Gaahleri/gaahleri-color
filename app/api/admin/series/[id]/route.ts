import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET single series
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        colors: true,
      },
    });

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

// PUT update series
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description } = body;

    const series = await prisma.series.update({
      where: { id },
      data: {
        name,
        slug: slug || null,
        description: description || null,
      },
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error updating series:", error);
    return NextResponse.json(
      { error: "Failed to update series" },
      { status: 500 }
    );
  }
}

// DELETE series
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.series.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Series deleted successfully" });
  } catch (error) {
    console.error("Error deleting series:", error);
    return NextResponse.json(
      { error: "Failed to delete series" },
      { status: 500 }
    );
  }
}
