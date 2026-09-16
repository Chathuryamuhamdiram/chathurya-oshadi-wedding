"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { ParsedEventPlanItem } from "@/lib/admin/event-plan-parser";

export async function saveEventPlanItem(
  id: string | null,
  eventId: string,
  activity: string,
  plannedTime: string | null,
  sortOrder: number
) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_MANAGE); // Reuse events permission

    if (!activity.trim()) return { success: false, error: "Activity name is required" };

    const data = {
      eventId,
      activity: activity.trim(),
      plannedTime: plannedTime || null,
      sortOrder,
    };

    if (id) {
      await prisma.eventPlanItem.update({ where: { id }, data });
    } else {
      await prisma.eventPlanItem.create({ data });
    }

    revalidatePath("/admin/event-plan");
    revalidatePath("/admin/wedding-day");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEventPlanItem(id: string) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_MANAGE);
    await prisma.eventPlanItem.delete({ where: { id } });

    revalidatePath("/admin/event-plan");
    revalidatePath("/admin/wedding-day");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderEventPlanItems(items: { id: string; sortOrder: number }[]) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_MANAGE);
    
    // Perform bulk update in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.eventPlanItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath("/admin/event-plan");
    revalidatePath("/admin/wedding-day");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkSaveEventPlanItems(eventId: string, items: ParsedEventPlanItem[]) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_MANAGE);

    // Get current max sortOrder for this event to append new items correctly
    const existing = await prisma.eventPlanItem.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'desc' },
      take: 1
    });
    
    let currentSortOrder = existing.length > 0 ? existing[0].sortOrder + 10 : 10;

    for (const item of items) {
      if (item.status === "DUPLICATE") {
        // If duplicate was marked as Add Anyway, it will have status "NEW" set by UI
        continue; // SKIP
      }
      
      if (item.status === "SAME TIME" && item.existingId) {
        // UPDATE EXISTING
        await prisma.eventPlanItem.update({
          where: { id: item.existingId },
          data: { plannedTime: item.plannedTime || null }
        });
      } else {
        // NEW (or Add Anyway)
        await prisma.eventPlanItem.create({
          data: {
            eventId,
            activity: item.activity.trim(),
            plannedTime: item.plannedTime || null,
            sortOrder: currentSortOrder,
          }
        });
        currentSortOrder += 10;
      }
    }

    revalidatePath("/admin/event-plan");
    revalidatePath("/admin/wedding-day");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
