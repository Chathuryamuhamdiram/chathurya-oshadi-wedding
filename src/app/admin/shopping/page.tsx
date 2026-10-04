import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS, type PermissionCode } from "@/lib/permissions";
import ShoppingListPageClient from "./ShoppingListPageClient";

export default async function ShoppingListsPage() {
  const session = await requirePermission(PERMISSIONS.SHOPPING_VIEW as PermissionCode);
  
  const permissions = session.permissions || [];
  const role = session.role as string;

  const listsRaw = await prisma.shoppingList.findMany({
    include: {
      items: {
        select: { id: true, isBought: true }
      },
      event: { select: { id: true, name: true, eventType: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const lists = listsRaw.map(l => ({
    id: l.id,
    name: l.name,
    eventContext: l.eventContext,
    eventId: l.eventId,
    shoppingDate: l.shoppingDate ? l.shoppingDate.toISOString() : null,
    notes: l.notes,
    status: l.status,
    items: l.items.map(i => ({ id: i.id, isBought: i.isBought })),
    event: l.event ? { id: l.event.id, name: l.event.name, eventType: l.event.eventType } : null
  }));
  
  const ceremonyEventsRaw = await prisma.ceremonyEvent.findMany({
    where: { isActive: true },
    select: { id: true, name: true, eventType: true }
  });

  const ceremonyEvents = ceremonyEventsRaw.map(e => ({
    id: e.id,
    name: e.name,
    eventType: e.eventType
  }));

  return (
    <ShoppingListPageClient 
      lists={lists} 
      role={role} 
      permissions={permissions} 
      events={ceremonyEvents} 
    />
  );
}
