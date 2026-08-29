"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUnreadNotificationsAction(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Only fetch the latest 20
    });

    return { count, notifications };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { count: 0, notifications: [] };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsReadAction(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    return { success: false };
  }
}
