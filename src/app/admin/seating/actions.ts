"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function createSeatingTable(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.SEATING_EDIT);
    const name = formData.get("name") as string;
    const capacity = parseInt(formData.get("capacity") as string || "8");

    if (!name) return { success: false, error: "Table name is required" };

    await prisma.seatingTable.create({
      data: { name, capacity }
    });

    revalidatePath("/admin/seating");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignGuestToTable(guestId: string, tableId: string | null) {
  try {
    await requirePermission(PERMISSIONS.SEATING_EDIT);
    await prisma.guest.update({
      where: { id: guestId },
      data: { tableId }
    });
    revalidatePath("/admin/seating");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



export async function deleteSeatingTable(id: string) {
  try {
    await requirePermission(PERMISSIONS.SEATING_EDIT);
    // Unassign all guests first (Prisma might handle this via foreign keys, but to be safe)
    await prisma.guest.updateMany({
      where: { tableId: id },
      data: { tableId: null }
    });
    
    await prisma.seatingTable.delete({ where: { id } });
    revalidatePath("/admin/seating");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
