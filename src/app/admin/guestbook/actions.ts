"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function toggleGuestbookVisibility(id: string, currentStatus: boolean) {
  try {
    await requirePermission(PERMISSIONS.GUESTBOOK_MANAGE);
    
    await prisma.guestbookEntry.update({
      where: { id },
      data: { isPublic: !currentStatus }
    });
    
    revalidatePath("/admin/guestbook");
    revalidatePath("/(public)"); // Also revalidate the public page
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update visibility" };
  }
}

export async function deleteGuestbookEntry(id: string) {
  try {
    await requirePermission(PERMISSIONS.GUESTBOOK_MANAGE);
    
    await prisma.guestbookEntry.delete({
      where: { id }
    });
    
    revalidatePath("/admin/guestbook");
    revalidatePath("/(public)");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete entry" };
  }
}
