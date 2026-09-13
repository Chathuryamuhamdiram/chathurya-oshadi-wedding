import { prisma } from "@/lib/db";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import FoodMenuClient from "@/components/admin/food-menu/FoodMenuClient";
import { redirect } from "next/navigation";

export default async function FoodMenuPage() {
  const session = await requirePermission(PERMISSIONS.MENU_VIEW);
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const canEdit = isSuperAdmin || (session.permissions || []).includes(PERMISSIONS.MENU_EDIT) || session.role === "ADMIN";
  
  const activeEventId = await getActiveEventId();
  const isAllEvents = activeEventId === ALL_EVENTS_VALUE;

  let activeEvent = null;
  if (!isAllEvents) {
    activeEvent = await prisma.ceremonyEvent.findUnique({
      where: { id: activeEventId },
      select: { id: true, name: true, eventType: true }
    });
  }

  // Load the menu for the active event. If "All Events" is selected, we might either show a message or list all. 
  // Let's pass the data to the client component to handle the UI state.
  const menus = await prisma.foodMenu.findMany({
    where: isAllEvents ? {} : { eventId: activeEventId },
    include: {
      event: { select: { id: true, name: true, eventType: true } },
      vendor: true,
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
            include: { vendor: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const vendors = await prisma.vendor.findMany({
    where: { isArchived: false },
    orderBy: { vendorName: 'asc' }
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      <FoodMenuClient 
        activeEventId={activeEventId}
        isAllEvents={isAllEvents}
        activeEvent={activeEvent}
        menus={menus} 
        vendors={vendors}
        canEdit={canEdit}
      />
    </div>
  );
}
