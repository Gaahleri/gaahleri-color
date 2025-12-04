"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createColor(data: {
  name: string;
  hex: string;
  rgb: string;
  seriesId: string;
  description?: string;
  buyLink?: string;
  badge?: string;
  status?: string;
}) {
  await requireAdmin();

  try {
    const color = await prisma.color.create({
      data,
    });
    revalidatePath("/admin");
    revalidatePath("/make-color");
    return { success: true, color };
  } catch (error) {
    console.error("Failed to create color:", error);
    return { success: false, error: "Failed to create color" };
  }
}

export async function updateColor(
  id: string,
  data: {
    name?: string;
    hex?: string;
    rgb?: string;
    seriesId?: string;
    description?: string;
    buyLink?: string;
    badge?: string;
    status?: string;
  }
) {
  await requireAdmin();

  try {
    const color = await prisma.color.update({
      where: { id },
      data,
    });
    revalidatePath("/admin");
    revalidatePath("/make-color");
    return { success: true, color };
  } catch (error) {
    console.error("Failed to update color:", error);
    return { success: false, error: "Failed to update color" };
  }
}

export async function deleteColor(id: string) {
  await requireAdmin();

  try {
    await prisma.color.delete({
      where: { id },
    });
    revalidatePath("/admin");
    revalidatePath("/make-color");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete color:", error);
    return { success: false, error: "Failed to delete color" };
  }
}
