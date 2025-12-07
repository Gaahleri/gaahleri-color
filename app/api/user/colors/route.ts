import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthForApi } from "@/lib/auth";

// GET user's saved colors
export async function GET() {
  try {
    const userId = await requireAuthForApi();

    const records = await prisma.userRecord.findMany({
      where: { userId },
      include: {
        color: {
          include: {
            series: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching user records:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// POST add color to user's collection
export async function POST(req: Request) {
  try {
    const userId = await requireAuthForApi();

    const body = await req.json();
    const { colorId, note, isFavorite } = body;

    if (!colorId) {
      return NextResponse.json(
        { error: "colorId is required" },
        { status: 400 }
      );
    }

    // Ensure user exists in database (auto-create if not)
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Get user details from Clerk
      const { auth, clerkClient } = await import("@clerk/nextjs/server");
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);

      // Get country from Vercel header
      const country = req.headers.get("x-vercel-ip-country") || null;

      // Create user in database
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null,
          imageUrl: clerkUser.imageUrl || null,
          country: country,
        },
      });
    }

    // Check if already saved
    const existing = await prisma.userRecord.findUnique({
      where: {
        userId_colorId: {
          userId,
          colorId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Color already saved" },
        { status: 400 }
      );
    }

    const record = await prisma.userRecord.create({
      data: {
        userId,
        colorId,
        note: note || null,
        isFavorite: isFavorite || false,
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

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error saving color:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to save color" },
      { status: 500 }
    );
  }
}

