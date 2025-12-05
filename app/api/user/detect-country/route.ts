import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Vercel sets this header automatically
  const country = request.headers.get("x-vercel-ip-country");
  
  // For local development, we can mock it or return null
  // If no header is present (local dev), return null or a default
  
  return NextResponse.json({ 
    country: country || null,
    // Debug info - remove in production if sensitive
    detected: !!country
  });
}
