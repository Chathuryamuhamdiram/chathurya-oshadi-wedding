"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export async function saveLogistics(formData: FormData) {
  try {
    await requirePermission(PERMISSIONS.TRANSPORT_EDIT);
    const id = formData.get("id") as string | null;
    const guestId = formData.get("guestId") as string;
    const arrivalDateStr = formData.get("arrivalDate") as string;
    const departureDateStr = formData.get("departureDate") as string;
    const accommodationName = formData.get("accommodationName") as string;
    const transportNotes = formData.get("transportNotes") as string;

    if (!guestId) return { success: false, error: "Guest is required" };

    const data = {
      guestId,
      arrivalDateTime: arrivalDateStr ? new Date(arrivalDateStr) : null,
      departureDateTime: departureDateStr ? new Date(departureDateStr) : null,
      accommodationName: accommodationName || null,
      transportNotes: transportNotes || null,
    };

    if (id) {
      await prisma.guestLogistics.update({ where: { id }, data });
    } else {
      // Upsert just in case there's a unique constraint clash
      await prisma.guestLogistics.upsert({
        where: { guestId },
        update: data,
        create: data
      });
    }

    revalidatePath("/admin/logistics");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLogistics(id: string) {
  try {
    await requirePermission(PERMISSIONS.TRANSPORT_EDIT);
    await prisma.guestLogistics.delete({ where: { id } });
    revalidatePath("/admin/logistics");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
