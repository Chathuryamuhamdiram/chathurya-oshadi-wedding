import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS, type PermissionCode } from "@/lib/permissions";
import { notFound } from "next/navigation";
import ShoppingListDetailClient from "./ShoppingListDetailClient";

export default async function ShoppingListDetailPage({ params }: { params: { listId: string } }) {
  const session = await requirePermission(PERMISSIONS.SHOPPING_VIEW as PermissionCode);
  const permissions = session.permissions || [];
  const role = session.role as string;

  const list = await prisma.shoppingList.findUnique({
    where: { id: params.listId },
    include: {
      categories: { orderBy: { createdAt: "asc" } },
      shops: { orderBy: { createdAt: "asc" } },
      items: { orderBy: { createdAt: "asc" } },
      event: true
    }
  });

  if (!list) return notFound();

  return <ShoppingListDetailClient list={list} role={role} permissions={permissions} />;
}
