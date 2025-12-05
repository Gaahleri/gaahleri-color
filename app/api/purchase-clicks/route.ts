import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/purchase-clicks - Record a purchase click
export async function POST(request: NextRequest) {
  try {
    const { colorId } = await request.json();

    if (!colorId) {
      return NextResponse.json(
        { error: "Color ID is required" },
        { status: 400 }
      );
    }

    // Get user ID if logged in (optional)
    const { userId } = await auth();
    
    // Get country from Vercel header
    const country = request.headers.get("x-vercel-ip-country");

    // Create the purchase click record
    const purchaseClick = await prisma.purchaseClick.create({
      data: {
        colorId,
        userId: userId || null,
        country: country || null,
      },
    });

    return NextResponse.json(purchaseClick, { status: 201 });
  } catch (error) {
    console.error("Failed to record purchase click:", error);
    return NextResponse.json(
      { error: "Failed to record purchase click" },
      { status: 500 }
    );
  }
}
