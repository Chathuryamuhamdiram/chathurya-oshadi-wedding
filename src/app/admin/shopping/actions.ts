"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createShoppingList(data: { name: string, eventContext?: string, eventId?: string, shoppingDate?: Date, notes?: string }) {
  const list = await prisma.shoppingList.create({
    data: {
      name: data.name,
      eventContext: data.eventContext || null,
      eventId: data.eventId || null,
      shoppingDate: data.shoppingDate || null,
      notes: data.notes || null,
    }
  });
  revalidatePath("/admin/shopping");
  return list;
}

export async function updateShoppingList(id: string, data: Partial<{ name: string, status: string, notes: string, eventContext: string | null }>) {
  const list = await prisma.shoppingList.update({
    where: { id },
    data
  });
  revalidatePath(`/admin/shopping/${id}`);
  revalidatePath("/admin/shopping");
  return list;
}

export async function deleteShoppingList(id: string) {
  await prisma.shoppingList.delete({
    where: { id }
  });
  revalidatePath("/admin/shopping");
}

export async function duplicateShoppingList(id: string, newName: string, newEventContext?: string, newEventId?: string) {
  const original = await prisma.shoppingList.findUnique({
    where: { id },
    include: { categories: true, shops: true, items: true }
  });
  if (!original) throw new Error("Not found");

  const newList = await prisma.shoppingList.create({
    data: {
      name: newName,
      eventContext: newEventContext || null,
      eventId: newEventId || null,
      notes: original.notes,
      categories: {
        create: original.categories.map(c => ({ name: c.name, sortOrder: c.sortOrder }))
      },
      shops: {
        create: original.shops.map(s => ({ name: s.name, sortOrder: s.sortOrder }))
      }
    },
    include: { categories: true, shops: true }
  });

  const categoryMap = new Map();
  original.categories.forEach((c, idx) => categoryMap.set(c.id, newList.categories[idx].id));
  
  const shopMap = new Map();
  original.shops.forEach((s, idx) => shopMap.set(s.id, newList.shops[idx].id));

  for (const item of original.items) {
    await prisma.shoppingItem.create({
      data: {
        shoppingListId: newList.id,
        categoryId: item.categoryId ? categoryMap.get(item.categoryId) : null,
        shopId: item.shopId ? shopMap.get(item.shopId) : null,
        name: item.name,
        quantity: item.quantity,
        note: item.note,
        isBought: false,
        sortOrder: item.sortOrder
      }
    });
  }
  revalidatePath("/admin/shopping");
  return newList.id;
}

export async function addCategory(listId: string, name: string) {
  const c = await prisma.shoppingCategory.create({
    data: { shoppingListId: listId, name }
  });
  revalidatePath(`/admin/shopping/${listId}`);
  return c;
}

export async function addShop(listId: string, name: string) {
  const s = await prisma.shoppingShop.create({
    data: { shoppingListId: listId, name }
  });
  revalidatePath(`/admin/shopping/${listId}`);
  return s;
}

export async function addItem(listId: string, data: { name: string, quantity?: string, categoryId?: string, shopId?: string }) {
  const i = await prisma.shoppingItem.create({
    data: {
      shoppingListId: listId,
      name: data.name,
      quantity: data.quantity || null,
      categoryId: data.categoryId || null,
      shopId: data.shopId || null,
    }
  });
  revalidatePath(`/admin/shopping/${listId}`);
  return i;
}

export async function toggleItemBought(itemId: string, isBought: boolean, listId: string) {
  await prisma.shoppingItem.update({
    where: { id: itemId },
    data: { isBought }
  });
  revalidatePath(`/admin/shopping/${listId}`);
}

export async function updateItem(itemId: string, listId: string, data: { name?: string, quantity?: string | null, categoryId?: string | null, shopId?: string | null }) {
  await prisma.shoppingItem.update({
    where: { id: itemId },
    data
  });
  revalidatePath(`/admin/shopping/${listId}`);
}

export async function deleteItem(itemId: string, listId: string) {
  await prisma.shoppingItem.delete({
    where: { id: itemId }
  });
  revalidatePath(`/admin/shopping/${listId}`);
}

export async function bulkAddItems(listId: string, items: { name: string, quantity?: string | null, categoryId?: string | null, shopId?: string | null }[]) {
  const existingItems = await prisma.shoppingItem.findMany({
    where: { shoppingListId: listId }
  });
  
  // Normalize string for duplicate check
  const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const existingNames = new Set(existingItems.map(i => normalize(i.name)));
  
  const toCreate = [];
  for (const item of items) {
    if (!existingNames.has(normalize(item.name))) {
      toCreate.push({
        ...item,
        shoppingListId: listId
      });
      existingNames.add(normalize(item.name));
    }
  }

  if (toCreate.length > 0) {
    await prisma.shoppingItem.createMany({
      data: toCreate
    });
  }
  revalidatePath(`/admin/shopping/${listId}`);
  return toCreate.length;
}

export async function deleteCategory(categoryId: string, listId: string, fallbackCategoryId?: string | null) {
  if (fallbackCategoryId !== undefined) {
    await prisma.shoppingItem.updateMany({
      where: { categoryId },
      data: { categoryId: fallbackCategoryId }
    });
  }
  await prisma.shoppingCategory.delete({
    where: { id: categoryId }
  });
  revalidatePath(`/admin/shopping/${listId}`);
}

export async function deleteShop(shopId: string, listId: string, fallbackShopId?: string | null) {
  if (fallbackShopId !== undefined) {
    await prisma.shoppingItem.updateMany({
      where: { shopId },
      data: { shopId: fallbackShopId }
    });
  }
  await prisma.shoppingShop.delete({
    where: { id: shopId }
  });
  revalidatePath(`/admin/shopping/${listId}`);
}
