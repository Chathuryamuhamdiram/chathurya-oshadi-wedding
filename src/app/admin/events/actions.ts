"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

const venueSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function saveVenueAction(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_EDIT);
    const rawData = {
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      googleMapsUrl: formData.get("googleMapsUrl") || undefined,
      phone: formData.get("phone") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = venueSchema.parse(rawData);

    if (parsed.id) {
      await prisma.venue.update({
        where: { id: parsed.id },
        data: parsed,
      });
    } else {
      await prisma.venue.create({ data: parsed });
    }

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    console.error("Venue error:", error);
    return {
      success: false,
      error: error && typeof error === "object" && "errors" in error
        ? (error as any).errors.map((e: any) => e.message).join(", ")
        : error.message || "Failed to save venue"
    };
  }
}

export async function deleteVenueAction(id: string) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_EDIT);
    await prisma.venue.delete({ where: { id } });
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete venue" };
  }
}

const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venueId: z.string().optional(),
  visibility: z.string().default("PUBLIC"),
  sortOrder: z.coerce.number().default(0),
});

export async function saveEventAction(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_EDIT);
    const rawData = {
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      eventDate: formData.get("eventDate") || undefined,
      startTime: formData.get("startTime") || undefined,
      endTime: formData.get("endTime") || undefined,
      venueId: formData.get("venueId") === "UNASSIGNED" ? undefined : (formData.get("venueId") || undefined),
      visibility: formData.get("visibility") || "PUBLIC",
      sortOrder: formData.get("sortOrder") || 0,
    };

    const parsed = eventSchema.parse(rawData);
    const dateObj = parsed.eventDate ? new Date(parsed.eventDate) : null;

    if (parsed.id) {
      await prisma.weddingEvent.update({
        where: { id: parsed.id },
        data: {
          title: parsed.title,
          description: parsed.description,
          eventDate: dateObj,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          venueId: parsed.venueId,
          visibility: parsed.visibility,
          sortOrder: parsed.sortOrder,
        },
      });
    } else {
      await prisma.weddingEvent.create({
        data: {
          title: parsed.title,
          description: parsed.description,
          eventDate: dateObj,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          venueId: parsed.venueId,
          visibility: parsed.visibility,
          sortOrder: parsed.sortOrder,
        }
      });
    }

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    console.error("Event error:", error);
    return {
      success: false,
      error: error && typeof error === "object" && "errors" in error
        ? (error as any).errors.map((e: any) => e.message).join(", ")
        : error.message || "Failed to save event"
    };
  }
}

export async function saveEventItemAction(eventId: string, name: string, quantity: number) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_EDIT);
    if (!name || name.trim() === "") throw new Error("Item name is required");
    await prisma.eventItem.create({
      data: {
        eventId,
        name: name.trim(),
        quantity,
        status: "PENDING"
      }
    });
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleEventItemStatusAction(id: string, currentStatus: string) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_EDIT);
    const newStatus = currentStatus === "BOUGHT" ? "PENDING" : "BOUGHT";
    await prisma.eventItem.update({
      where: { id },
      data: { status: newStatus }
    });
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to update item status" };
  }
}

export async function deleteEventItemAction(id: string) {
  try {
    await requirePermission(PERMISSIONS.CALENDAR_EDIT);
    await prisma.eventItem.delete({ where: { id } });
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete item" };
  }
}
