"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission, createDeleteAuditLog } from "@/lib/admin/delete-helpers";

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
    const { session, error } = await checkDeletePermission(PERMISSIONS.GUESTBOOK_DELETE);
    if (error) return { success: false, error };

    const entry = await prisma.guestbookEntry.findUnique({
      where: { id },
    });

    if (!entry) return { success: false, error: "Entry not found" };

    await prisma.guestbookEntry.delete({
      where: { id }
    });
    
    await createDeleteAuditLog(
      session!.userId,
      "GuestbookEntry",
      id,
      { authorName: entry.name, contentPreview: entry.message.substring(0, 50) },
      "DELETE"
    );

    revalidatePath("/admin/guestbook");
    revalidatePath("/(public)");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete entry" };
  }
}
