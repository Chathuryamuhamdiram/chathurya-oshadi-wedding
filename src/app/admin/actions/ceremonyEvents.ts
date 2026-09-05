"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { CeremonyType, CeremonyStatus } from "@prisma/client";

export async function saveCeremonyEvent(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.EVENT_EDIT);
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const eventType = (formData.get("eventType") as CeremonyType) || "OTHER";
    const eventDateStr = formData.get("eventDate") as string;
    const startTime = formData.get("startTime") as string | null;
    const endTime = formData.get("endTime") as string | null;
    const venueName = formData.get("venueName") as string | null;
    const venueAddress = formData.get("venueAddress") as string | null;
    const description = formData.get("description") as string | null;
    const status = (formData.get("status") as CeremonyStatus) || "PLANNING";

    if (!name) return { success: false, error: "Event name is required" };

    const data = {
      name,
      eventType,
      eventDate: eventDateStr ? new Date(eventDateStr) : null,
      startTime,
      endTime,
      venueName,
      venueAddress,
      description,
      status,
    };

    if (id) {
      await prisma.ceremonyEvent.update({ where: { id }, data });
    } else {
      await prisma.ceremonyEvent.create({ data });
    }

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCeremonyEvent(id: string) {
  try {
    await requirePermission(PERMISSIONS.EVENT_DELETE);

    // Prevent deleting event if it has budget items or tasks
    const event = await prisma.ceremonyEvent.findUnique({
      where: { id },
      include: {
        budgetItems: { select: { id: true } },
        tasks: { select: { id: true } },
      },
    });

    if (!event) return { success: false, error: "Event not found" };

    if (event.budgetItems.length > 0 || event.tasks.length > 0) {
      return {
        success: false,
        error: `Cannot delete event '${event.name}' because it contains linked budget items (${event.budgetItems.length}) or tasks (${event.tasks.length}). Reassign or delete them first.`,
      };
    }

    await prisma.ceremonyEvent.delete({ where: { id } });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
