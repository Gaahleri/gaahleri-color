import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET user's recipes
export async function GET() {
  try {
    const userId = await requireAuth();

    const recipes = await prisma.recipe.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: {
            color: {
              select: {
                id: true,
                name: true,
                hex: true,
                rgb: true,
                buyLink: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST create new recipe
export async function POST(req: Request) {
  try {
    const userId = await requireAuth();

    const body = await req.json();
    const { name, description, resultHex, resultRgb, ingredients } = body;

    if (
      !name ||
      !resultHex ||
      !resultRgb ||
      !ingredients ||
      ingredients.length === 0
    ) {
      return NextResponse.json(
        { error: "Name, resultHex, resultRgb, and ingredients are required" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        description: description || null,
        resultHex,
        resultRgb,
        userId,
        ingredients: {
          create: ingredients.map(
            (ing: { colorId: string; parts: number }) => ({
              colorId: ing.colorId,
              parts: ing.parts,
            })
          ),
        },
      },
      include: {
        ingredients: {
          include: {
            color: {
              select: {
                id: true,
                name: true,
                hex: true,
                rgb: true,
                buyLink: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
