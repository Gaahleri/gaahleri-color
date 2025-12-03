import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// DELETE remove color from user's collection
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const record = await prisma.userRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (record.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.userRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Color removed from collection" });
  } catch (error) {
    console.error("Error removing color:", error);
    return NextResponse.json(
      { error: "Failed to remove color" },
      { status: 500 }
    );
  }
}

// PUT update user record (toggle favorite, update note)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const record = await prisma.userRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (record.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.userRecord.update({
      where: { id },
      data: {
        note: body.note !== undefined ? body.note : record.note,
        isFavorite:
          body.isFavorite !== undefined ? body.isFavorite : record.isFavorite,
      },
      include: {
        color: {
          include: {
            series: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating record:", error);
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 }
    );
  }
}
