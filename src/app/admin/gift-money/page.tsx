import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { GiftMoneyClient } from "./GiftMoneyClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Money Register | Admin",
  description: "Post-event gift money register for Wedding and Homecoming",
};

export const dynamic = "force-dynamic";

export default async function GiftMoneyPage() {
  await requirePermission(PERMISSIONS.GIFT_MONEY_VIEW);

  // Fetch active Wedding and Homecoming ceremony events
  const eventsRaw = await prisma.ceremonyEvent.findMany({
    where: {
      eventType: { in: ["WEDDING", "HOMECOMING"] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      eventType: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const events = eventsRaw.map((e) => ({
    id: e.id,
    name: e.name,
    eventType: e.eventType as "WEDDING" | "HOMECOMING",
  }));

  // Fetch all GiftMoneyEntry records
  const entriesRaw = await prisma.giftMoneyEntry.findMany({
    include: {
      event: {
        select: {
          id: true,
          name: true,
          eventType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimals and Dates for client component
  const entries = entriesRaw.map((entry) => ({
    id: entry.id,
    eventId: entry.eventId,
    name: entry.name,
    amount: Number(entry.amount),
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    createdById: entry.createdById,
    event: {
      id: entry.event.id,
      name: entry.event.name,
      eventType: entry.event.eventType,
    },
  }));

  return (
    <div className="max-w-[1400px] mx-auto py-2">
      <GiftMoneyClient initialEntries={entries} events={events} />
    </div>
  );
}
