import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { WEDDING_EVENT_NAME, ALL_EVENTS_VALUE, ACTIVE_EVENT_COOKIE } from "./event-constants";

export { WEDDING_EVENT_NAME, ALL_EVENTS_VALUE, ACTIVE_EVENT_COOKIE };

/**
 * Reads the active CeremonyEvent ID from the cookie.
 * Returns the eventId string, or "all" for all events.
 * Falls back to the Wedding event if the cookie is invalid/missing.
 */
export async function getActiveEventId(): Promise<string> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(ACTIVE_EVENT_COOKIE)?.value;

  // "all" is a valid explicit value
  if (stored === ALL_EVENTS_VALUE) return ALL_EVENTS_VALUE;

  // If a specific ID is stored, verify it still exists and is active
  if (stored) {
    const event = await prisma.ceremonyEvent.findFirst({
      where: { id: stored, isActive: true },
      select: { id: true },
    });
    if (event) return event.id;
  }

  // Fallback: find the Wedding event
  const wedding = await prisma.ceremonyEvent.findFirst({
    where: { eventType: "WEDDING", isActive: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (wedding) return wedding.id;

  // Last resort: any active event
  const any = await prisma.ceremonyEvent.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return any?.id ?? ALL_EVENTS_VALUE;
}

/**
 * Returns the Prisma `where` clause for filtering by event.
 * - If "all", returns {} (no filter)
 * - Otherwise, returns { eventId: id }
 */
export function buildEventFilter(activeEventId: string): { eventId?: string } {
  if (activeEventId === ALL_EVENTS_VALUE) return {};
  return { eventId: activeEventId };
}

/**
 * Returns { eventId } to inject into create operations.
 * If "all" is active, returns null (caller must handle requiring event selection).
 */
export function getEventIdForCreate(activeEventId: string): string | null {
  if (activeEventId === ALL_EVENTS_VALUE) return null;
  return activeEventId;
}
