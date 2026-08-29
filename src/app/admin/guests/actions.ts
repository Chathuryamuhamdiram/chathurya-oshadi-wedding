"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

const guestSchema = z.object({
  id: z.string().optional(),
  displayName: z.string().min(1, "Display name is required"),
  primaryContactName: z.string().optional(),
  whatsappNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  invitationType: z.enum(["INDIVIDUAL", "FAMILY"]),
  side: z.enum(["BRIDE", "GROOM", "BOTH"]),
  allowedGuestCount: z.coerce.number().min(1),
  liquorCount: z.coerce.number().min(0),
  notes: z.string().optional(),
}).refine((data) => data.liquorCount <= data.allowedGuestCount, {
  message: "Liquor count cannot exceed allowed seats",
  path: ["liquorCount"],
});

export async function saveGuestAction(formData: FormData) {
  try {
    const id = formData.get("id") as string | null;
    
    if (id) {
      await requirePermission(PERMISSIONS.GUEST_EDIT);
    } else {
      await requirePermission(PERMISSIONS.GUEST_CREATE);
    }

    const data = {
      id: formData.get("id") || undefined,
      displayName: formData.get("displayName") || "",
      primaryContactName: formData.get("primaryContactName") || undefined,
      whatsappNumber: formData.get("whatsappNumber") || undefined,
      email: formData.get("email") || "",
      invitationType: formData.get("invitationType") || "INDIVIDUAL",
      side: formData.get("side") || "BRIDE",
      allowedGuestCount: Number(formData.get("allowedGuestCount")),
      liquorCount: Number(formData.get("liquorCount") || 0),
      notes: formData.get("notes") || undefined,
    };

    const validatedData = guestSchema.parse(data);

    if (validatedData.id) {
      // Update
      await prisma.guest.update({
        where: { id: validatedData.id },
        data: {
          displayName: validatedData.displayName,
          primaryContactName: validatedData.primaryContactName,
          whatsappNumber: validatedData.whatsappNumber,
          email: validatedData.email || null,
          invitationType: validatedData.invitationType,
          side: validatedData.side,
          allowedGuestCount: validatedData.allowedGuestCount,
          liquorCount: validatedData.liquorCount,
          notes: validatedData.notes,
        },
      });
    } else {
      // Create
      // Generate a unique 8-character invitation code
      const code = nanoid(8).toUpperCase();
      await prisma.guest.create({
        data: {
          displayName: validatedData.displayName,
          primaryContactName: validatedData.primaryContactName,
          whatsappNumber: validatedData.whatsappNumber,
          email: validatedData.email || null,
          invitationType: validatedData.invitationType,
          side: validatedData.side,
          allowedGuestCount: validatedData.allowedGuestCount,
          liquorCount: validatedData.liquorCount,
          notes: validatedData.notes,
          invitationCode: code,
          rsvpStatus: "PENDING",
          invitationStatus: "NOT_SENT",
          confirmedGuestCount: 0,
        },
      });
    }

    revalidatePath("/admin/guests");
    return { success: true };
  } catch (error: any) {
    console.error("Save guest error:", error);
    return { 
      success: false, 
      error: error && typeof error === "object" && "errors" in error
        ? (error as any).errors.map((e: any) => e.message).join(", ") 
        : error.message || "Failed to save guest" 
    };
  }
}

export async function deleteGuestAction(id: string) {
  try {
    await requirePermission(PERMISSIONS.GUEST_DELETE);

    await prisma.guest.delete({
      where: { id },
    });
    revalidatePath("/admin/guests");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete guest" };
  }
}
