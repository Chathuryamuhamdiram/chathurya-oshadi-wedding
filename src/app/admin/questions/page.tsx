import { prisma } from "@/lib/db";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { QuestionsClient } from "./QuestionsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions & Clarifications | Admin",
};

export default async function QuestionsPage() {
  await requirePermission(PERMISSIONS.CALENDAR_VIEW);

  const activeEventId = await getActiveEventId();
  const isAllEvents = activeEventId === ALL_EVENTS_VALUE;

  const [questionsRaw, vendorsRaw, eventsRaw] = await Promise.all([
    prisma.questionClarification.findMany({
      where: isAllEvents ? {} : { eventId: activeEventId },
      include: {
        vendor: { select: { id: true, vendorName: true, phone: true, whatsappNumber: true } },
        event: { select: { id: true, name: true, eventType: true } }
      },
      orderBy: [
        { status: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.vendor.findMany({
      where: { isArchived: false },
      select: { id: true, vendorName: true, phone: true, whatsappNumber: true },
      orderBy: { vendorName: 'asc' }
    }),
    prisma.ceremonyEvent.findMany({
      where: { isActive: true },
      select: { id: true, name: true, eventType: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  const questions = questionsRaw.map(q => ({
    ...q,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    followUpDate: q.followUpDate ? q.followUpDate.toISOString() : null,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white">Questions & Clarifications</h1>
          <p className="text-white/50 text-sm mt-1 font-sans">
            Prepare and track questions for vendors and venues.
          </p>
        </div>
      </div>

      <QuestionsClient 
        initialQuestions={questions} 
        vendors={vendorsRaw} 
        events={eventsRaw} 
        activeEventId={activeEventId}
      />
    </div>
  );
}
