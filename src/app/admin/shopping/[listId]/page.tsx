import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS, type PermissionCode } from "@/lib/permissions";
import { notFound } from "next/navigation";
import ShoppingListDetailClient from "./ShoppingListDetailClient";

export default async function ShoppingListDetailPage(props: { params: Promise<{ listId: string }> }) {
  const params = await props.params;
  const session = await requirePermission(PERMISSIONS.SHOPPING_VIEW as PermissionCode);
  const permissions = session.permissions || [];
  const role = session.role as string;

  const listRaw = await prisma.shoppingList.findUnique({
    where: { id: params.listId },
    include: {
      categories: { orderBy: { createdAt: "asc" } },
      shops: { orderBy: { createdAt: "asc" } },
      items: { orderBy: { createdAt: "asc" } },
      event: true
    }
  });

  if (!listRaw) return notFound();

  const list = {
    id: listRaw.id,
    name: listRaw.name,
    eventContext: listRaw.eventContext,
    eventId: listRaw.eventId,
    shoppingDate: listRaw.shoppingDate ? listRaw.shoppingDate.toISOString() : null,
    notes: listRaw.notes,
    status: listRaw.status,
    event: listRaw.event ? {
      id: listRaw.event.id,
      name: listRaw.event.name
    } : null,
    categories: listRaw.categories.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color
    })),
    shops: listRaw.shops.map(s => ({
      id: s.id,
      name: s.name,
      location: s.location
    })),
    items: listRaw.items.map(i => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      note: i.note,
      isBought: i.isBought,
      categoryId: i.categoryId,
      shopId: i.shopId
    }))
  };

  return <ShoppingListDetailClient list={list} role={role} permissions={permissions} />;
}
