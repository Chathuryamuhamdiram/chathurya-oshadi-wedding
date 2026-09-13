"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/permissions";

export async function createOrUpdateMenu(eventId: string, data: any) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  let menu = await prisma.foodMenu.findFirst({
    where: { eventId }
  });

  if (menu) {
    menu = await prisma.foodMenu.update({
      where: { id: menu.id },
      data: {
        title: data.title,
        venue: data.venue,
        vendorId: data.vendorId || null,
        status: data.status,
        notes: data.notes
      }
    });
    
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_MENU",
        entity: "FoodMenu",
        entityId: menu.id,
        newValue: JSON.stringify(data)
      }
    });
  } else {
    menu = await prisma.foodMenu.create({
      data: {
        eventId,
        title: data.title,
        venue: data.venue,
        vendorId: data.vendorId || null,
        status: data.status || "DRAFT",
        notes: data.notes
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_MENU",
        entity: "FoodMenu",
        entityId: menu.id,
        newValue: JSON.stringify(data)
      }
    });
  }

  revalidatePath("/admin/food-menu");
  return { success: true, menu };
}

export async function addSection(menuId: string, title: string) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  const existingSectionsCount = await prisma.foodMenuSection.count({
    where: { menuId }
  });

  const section = await prisma.foodMenuSection.create({
    data: {
      menuId,
      title,
      sortOrder: existingSectionsCount
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "CREATE_MENU_SECTION",
      entity: "FoodMenuSection",
      entityId: section.id,
      newValue: title
    }
  });

  revalidatePath("/admin/food-menu");
  return { success: true, section };
}

export async function updateSection(sectionId: string, title: string) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  const section = await prisma.foodMenuSection.update({
    where: { id: sectionId },
    data: { title }
  });

  revalidatePath("/admin/food-menu");
  return { success: true, section };
}

export async function deleteSection(sectionId: string) {
  const session = await requirePermission(PERMISSIONS.MENU_DELETE);

  await prisma.foodMenuSection.delete({
    where: { id: sectionId }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "DELETE_MENU_SECTION",
      entity: "FoodMenuSection",
      entityId: sectionId
    }
  });

  revalidatePath("/admin/food-menu");
  return { success: true };
}

export async function reorderSections(menuId: string, sectionIds: string[]) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  const updates = sectionIds.map((id, index) => 
    prisma.foodMenuSection.update({
      where: { id },
      data: { sortOrder: index }
    })
  );

  await prisma.$transaction(updates);

  revalidatePath("/admin/food-menu");
  return { success: true };
}

export async function addItem(sectionId: string, data: any) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  const existingItemsCount = await prisma.foodMenuItem.count({
    where: { sectionId }
  });

  const item = await prisma.foodMenuItem.create({
    data: {
      sectionId,
      name: data.name,
      description: data.description || null,
      cost: data.cost ? parseFloat(data.cost) : null,
      costType: data.costType || null,
      vendorId: data.vendorId || null,
      status: data.status || "PLANNED",
      sortOrder: existingItemsCount
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "CREATE_MENU_ITEM",
      entity: "FoodMenuItem",
      entityId: item.id,
      newValue: data.name
    }
  });

  revalidatePath("/admin/food-menu");
  return { success: true, item };
}

export async function updateItem(itemId: string, data: any) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  const item = await prisma.foodMenuItem.update({
    where: { id: itemId },
    data: {
      name: data.name,
      description: data.description || null,
      cost: data.cost ? parseFloat(data.cost) : null,
      costType: data.costType || null,
      vendorId: data.vendorId || null,
      status: data.status
    }
  });

  revalidatePath("/admin/food-menu");
  return { success: true, item };
}

export async function deleteItem(itemId: string) {
  const session = await requirePermission(PERMISSIONS.MENU_DELETE);

  await prisma.foodMenuItem.delete({
    where: { id: itemId }
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "DELETE_MENU_ITEM",
      entity: "FoodMenuItem",
      entityId: itemId
    }
  });

  revalidatePath("/admin/food-menu");
  return { success: true };
}

export async function reorderItems(sectionId: string, itemIds: string[]) {
  const session = await requirePermission(PERMISSIONS.MENU_EDIT);

  const updates = itemIds.map((id, index) => 
    prisma.foodMenuItem.update({
      where: { id },
      data: { sortOrder: index }
    })
  );

  await prisma.$transaction(updates);

  revalidatePath("/admin/food-menu");
  return { success: true };
}
