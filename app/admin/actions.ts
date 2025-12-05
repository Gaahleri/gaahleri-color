"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/auth";

export async function createColor(data: {
  name: string;
  hex: string;
  rgb: string;
  seriesId: string;
  description?: string;
  buyLink?: string;
  badge?: string;
  badgeColor?: string;
  status?: string;
  statusColor?: string;
}) {
  await requireAdminForAction();

  try {
    const color = await prisma.color.create({
      data: {
        name: data.name,
        hex: data.hex,
        rgb: data.rgb,
        seriesId: data.seriesId,
        description: data.description || null,
        buyLink: data.buyLink || null,
        badge: data.badge || null,
        badgeColor: data.badgeColor || null,
        status: data.status || null,
        statusColor: data.statusColor || null,
      },
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
    badgeColor?: string;
    status?: string;
    statusColor?: string;
  }
) {
  console.log("updateColor called with id:", id, "data:", JSON.stringify(data));
  
  await requireAdminForAction();

  try {
    // 构建更新数据，只包含非 undefined 的字段
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.hex !== undefined) updateData.hex = data.hex;
    if (data.rgb !== undefined) updateData.rgb = data.rgb;
    if (data.seriesId !== undefined) updateData.seriesId = data.seriesId;
    
    // 可选字段：空字符串转为 null
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.buyLink !== undefined) updateData.buyLink = data.buyLink || null;
    if (data.badge !== undefined) updateData.badge = data.badge || null;
    if (data.badgeColor !== undefined) updateData.badgeColor = data.badgeColor || null;
    if (data.status !== undefined) updateData.status = data.status || null;
    if (data.statusColor !== undefined) updateData.statusColor = data.statusColor || null;

    console.log("updateData to be sent to Prisma:", JSON.stringify(updateData));

    const color = await prisma.color.update({
      where: { id },
      data: updateData,
    });
    
    console.log("Color updated successfully:", color.id);
    
    revalidatePath("/admin");
    revalidatePath("/make-color");
    return { success: true, color };
  } catch (error) {
    console.error("Failed to update color - Error details:", error);
    return { success: false, error: "Failed to update color" };
  }
}

export async function deleteColor(id: string) {
  await requireAdminForAction();

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

