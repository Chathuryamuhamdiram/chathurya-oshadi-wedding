"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACTIVE_EVENT_COOKIE, ALL_EVENTS_VALUE } from "@/lib/event-context";

/**
 * Sets the active ceremony event cookie.
 * Validates the event exists before storing.
 */
export async function setActiveEvent(eventId: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const cookieStore = await cookies();

  if (eventId === ALL_EVENTS_VALUE) {
    cookieStore.set(ACTIVE_EVENT_COOKIE, ALL_EVENTS_VALUE, {
      httpOnly: true,
      path: "/admin",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    revalidatePath("/admin", "layout");
    return { success: true };
  }

  // Validate event exists
  const event = await prisma.ceremonyEvent.findFirst({
    where: { id: eventId, isActive: true },
    select: { id: true },
  });

  if (!event) return { success: false, error: "Event not found or inactive" };

  cookieStore.set(ACTIVE_EVENT_COOKIE, eventId, {
    httpOnly: true,
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/admin", "layout");
  return { success: true };
}
