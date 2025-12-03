import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type for color with series
interface ColorWithSeries {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: { id: string; name: string };
}

interface ColorWithDistance extends ColorWithSeries {
  distance: number;
  matchPercentage: number;
}

// Helper function to calculate color distance (Euclidean)
function colorDistance(rgb1: number[], rgb2: number[]): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

// Parse RGB string "R,G,B" to array [R, G, B]
function parseRgb(rgbString: string): number[] {
  return rgbString.split(",").map((s) => parseInt(s.trim(), 10));
}

export async function POST(request: NextRequest) {
  try {
    const { r, g, b, limit = 5 } = await request.json();

    if (
      typeof r !== "number" ||
      typeof g !== "number" ||
      typeof b !== "number"
    ) {
      return NextResponse.json(
        { error: "RGB values are required" },
        { status: 400 }
      );
    }

    const targetRgb = [r, g, b];

    // Get all colors from database
    const colors = await prisma.color.findMany({
      include: { series: true },
    });

    // Calculate distance for each color and sort
    const colorsWithDistance: ColorWithDistance[] = (
      colors as ColorWithSeries[]
    )
      .map((color) => {
        const colorRgb = parseRgb(color.rgb);
        const distance = colorDistance(targetRgb, colorRgb);
        return {
          ...color,
          distance,
          matchPercentage: Math.max(0, 100 - distance / 4.41828),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      target: {
        r,
        g,
        b,
        hex: `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
      },
      matches: colorsWithDistance.map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
        rgb: c.rgb,
        buyLink: c.buyLink,
        series: c.series,
        distance: c.distance,
        matchPercentage: Math.round(c.matchPercentage),
      })),
    });
  } catch (error) {
    console.error("Error finding closest colors:", error);
    return NextResponse.json(
      { error: "Failed to find colors" },
      { status: 500 }
    );
  }
}
