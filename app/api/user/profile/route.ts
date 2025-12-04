import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { auth, clerkClient } from "@clerk/nextjs/server";

// GET user profile
export async function GET() {
  try {
    const userId = await requireAuth();

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user doesn't exist in database, create them
    if (!user) {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);

      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null,
          imageUrl: clerkUser.imageUrl || null,
        },
      });
    }

    return NextResponse.json(user, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT update user profile (country)
export async function PUT(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await req.json();

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);

      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null,
          imageUrl: clerkUser.imageUrl || null,
          country: body.country || null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          country: body.country !== undefined ? body.country : user.country,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
