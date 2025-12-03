import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import mixbox from "mixbox";

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

interface Color {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  buyLink: string | null;
  series: { id: string; name: string };
}

interface MixResult {
  colors: { color: Color; parts: number }[];
  resultHex: string;
  resultRgb: number[];
  distance: number;
  matchPercentage: number;
}

// Mix colors using mixbox and return the result
function mixColors(colors: { rgb: number[]; parts: number }[]): number[] {
  const totalParts = colors.reduce((sum, c) => sum + c.parts, 0);

  const z_mix = [0, 0, 0, 0, 0, 0, 0];

  for (const { rgb, parts } of colors) {
    const ratio = parts / totalParts;
    const z = mixbox.rgbToLatent(rgb as [number, number, number]);
    for (let i = 0; i < z_mix.length; i++) {
      z_mix[i] += z[i] * ratio;
    }
  }

  return mixbox.latentToRgb(
    z_mix as [number, number, number, number, number, number, number]
  );
}

export async function POST(request: NextRequest) {
  try {
    const { r, g, b, maxColors = 3 } = await request.json();

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
    const dbColors = await prisma.color.findMany({
      include: { series: true },
    });

    const colors: (Color & { rgbArray: number[] })[] = dbColors.map(
      (c: Color) => ({
        ...c,
        rgbArray: parseRgb(c.rgb),
      })
    );

    const suggestions: MixResult[] = [];

    // Try single colors first
    for (const color of colors) {
      const distance = colorDistance(targetRgb, color.rgbArray);
      suggestions.push({
        colors: [{ color, parts: 1 }],
        resultHex: color.hex,
        resultRgb: color.rgbArray,
        distance,
        matchPercentage: Math.max(0, 100 - distance / 4.41828),
      });
    }

    // Try 2-color combinations
    if (maxColors >= 2) {
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          // Try different ratios
          for (const ratio of [1, 2, 3, 4]) {
            const mixResult = mixColors([
              { rgb: colors[i].rgbArray, parts: ratio },
              { rgb: colors[j].rgbArray, parts: 10 - ratio },
            ]);
            const distance = colorDistance(targetRgb, mixResult);
            const resultHex = `#${mixResult[0]
              .toString(16)
              .padStart(2, "0")}${mixResult[1]
              .toString(16)
              .padStart(2, "0")}${mixResult[2].toString(16).padStart(2, "0")}`;

            suggestions.push({
              colors: [
                { color: colors[i], parts: ratio },
                { color: colors[j], parts: 10 - ratio },
              ],
              resultHex,
              resultRgb: mixResult,
              distance,
              matchPercentage: Math.max(0, 100 - distance / 4.41828),
            });
          }
        }
      }
    }

    // Sort by distance and return top results
    suggestions.sort((a, b) => a.distance - b.distance);
    const topSuggestions = suggestions.slice(0, 10);

    return NextResponse.json({
      target: {
        r,
        g,
        b,
        hex: `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
      },
      suggestions: topSuggestions.map((s) => ({
        colors: s.colors.map((c) => ({
          id: c.color.id,
          name: c.color.name,
          hex: c.color.hex,
          rgb: c.color.rgb,
          buyLink: c.color.buyLink,
          series: c.color.series,
          parts: c.parts,
        })),
        resultHex: s.resultHex,
        resultRgb: s.resultRgb,
        matchPercentage: Math.round(s.matchPercentage),
      })),
    });
  } catch (error) {
    console.error("Error suggesting mix:", error);
    return NextResponse.json(
      { error: "Failed to suggest mix" },
      { status: 500 }
    );
  }
}
