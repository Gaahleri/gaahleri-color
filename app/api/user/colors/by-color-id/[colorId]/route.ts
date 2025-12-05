import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth";

// DELETE remove color from user's collection by colorId
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ colorId: string }> }
) {
  try {
    const userId = await requireAuthForApi();
    const { colorId } = await params;

    // Find and delete the record
    const record = await prisma.userRecord.findUnique({
      where: {
        userId_colorId: {
          userId,
          colorId,
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.userRecord.delete({
      where: { id: record.id },
    });

    return NextResponse.json({ message: "Color removed from collection" });
  } catch (error) {
    console.error("Error removing color:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to remove color" },
      { status: 500 }
    );
  }
}

