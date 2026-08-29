"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveWeddingEvent(formData: FormData) {
  try {
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const eventDateStr = formData.get("eventDate") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const visibility = formData.get("visibility") as string || "PRIVATE";

    if (!title) return { success: false, error: "Event title is required" };

    const data = {
      title,
      description: description || null,
      eventDate: eventDateStr ? new Date(eventDateStr) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      visibility,
    };

    if (id) {
      await prisma.weddingEvent.update({ where: { id }, data });
    } else {
      await prisma.weddingEvent.create({ data });
    }

    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWeddingEvent(id: string) {
  try {
    await prisma.weddingEvent.delete({ where: { id } });
    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
