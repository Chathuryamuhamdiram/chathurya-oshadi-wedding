"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { checkDeletePermission } from "@/lib/admin/delete-helpers";
import { Prisma } from "@prisma/client";

export async function saveGiftMoneyEntryAction(formData: FormData) {
  try {
    const id = (formData.get("id") as string)?.trim() || null;
    const name = (formData.get("name") as string)?.trim();
    const amountStr = (formData.get("amount") as string)?.trim();
    const eventId = (formData.get("eventId") as string)?.trim();
    const note = (formData.get("note") as string)?.trim() || null;

    // Check granular permissions based on action
    const session = id 
      ? await requirePermission(PERMISSIONS.GIFT_MONEY_EDIT)
      : await requirePermission(PERMISSIONS.GIFT_MONEY_CREATE);

    if (!name) {
      return { success: false, error: "Person / Guest Name is required." };
    }

    if (!amountStr) {
      return { success: false, error: "Amount Received is required." };
    }

    const amountNum = parseFloat(amountStr.replace(/,/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      return { success: false, error: "Amount must be a valid positive number." };
    }

    if (!eventId) {
      return { success: false, error: "Please select an event (Wedding or Homecoming)." };
    }

    // Verify event exists
    const event = await prisma.ceremonyEvent.findUnique({
      where: { id: eventId }
    });
    if (!event) {
      return { success: false, error: "The selected event was not found." };
    }

    const decimalAmount = new Prisma.Decimal(amountNum.toFixed(2));

    if (id) {
      const existing = await prisma.giftMoneyEntry.findUnique({
        where: { id }
      });
      if (!existing) {
        return { success: false, error: "Entry not found." };
      }

      const updated = await prisma.giftMoneyEntry.update({
        where: { id },
        data: {
          name,
          amount: decimalAmount,
          eventId,
          note
        }
      });

      // Audit Log for update
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "UPDATE_GIFT_MONEY_ENTRY",
            entity: "GiftMoneyEntry",
            entityId: id,
            oldValue: JSON.stringify({
              name: existing.name,
              amount: existing.amount.toString(),
              eventId: existing.eventId,
              note: existing.note
            }),
            newValue: JSON.stringify({
              name: updated.name,
              amount: updated.amount.toString(),
              eventId: updated.eventId,
              note: updated.note
            })
          }
        });
      } catch (auditErr) {
        console.error("Failed to write audit log:", auditErr);
      }

      revalidatePath("/admin/gift-money");
      return { success: true, data: { id: updated.id } };
    } else {
      const created = await prisma.giftMoneyEntry.create({
        data: {
          name,
          amount: decimalAmount,
          eventId,
          note,
          createdById: session.userId || null
        }
      });

      // Audit Log for create
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "CREATE_GIFT_MONEY_ENTRY",
            entity: "GiftMoneyEntry",
            entityId: created.id,
            oldValue: null,
            newValue: JSON.stringify({
              name: created.name,
              amount: created.amount.toString(),
              eventId: created.eventId,
              note: created.note
            })
          }
        });
      } catch (auditErr) {
        console.error("Failed to write audit log:", auditErr);
      }

      revalidatePath("/admin/gift-money");
      return { success: true, data: { id: created.id } };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save gift money entry." };
  }
}

export async function deleteGiftMoneyEntryAction(id: string) {
  try {
    await requirePermission(PERMISSIONS.GIFT_MONEY_DELETE);
    const { session, error } = await checkDeletePermission(null);
    if (error) return { success: false, error };

    const entry = await prisma.giftMoneyEntry.findUnique({
      where: { id },
      include: {
        event: { select: { name: true } }
      }
    });

    if (!entry) {
      return { success: false, error: "Entry not found." };
    }

    await prisma.giftMoneyEntry.delete({
      where: { id }
    });

    // Audit Log for delete
    try {
      await prisma.auditLog.create({
        data: {
          userId: session?.userId,
          action: "DELETE_GIFT_MONEY_ENTRY",
          entity: "GiftMoneyEntry",
          entityId: id,
          oldValue: JSON.stringify({
            name: entry.name,
            amount: entry.amount.toString(),
            eventId: entry.eventId,
            eventName: entry.event?.name,
            note: entry.note
          }),
          newValue: null
        }
      });
    } catch (auditErr) {
      console.error("Failed to write delete audit log:", auditErr);
    }

    revalidatePath("/admin/gift-money");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete gift money entry." };
  }
}

export async function bulkPasteGiftMoneyAction(entries: {
  name: string;
  amount: number;
  eventId: string;
  note?: string | null;
}[]) {
  try {
    const session = await requirePermission(PERMISSIONS.GIFT_MONEY_CREATE);

    if (!Array.isArray(entries) || entries.length === 0) {
      return { success: false, error: "No valid entries provided." };
    }

    const dataToInsert = entries.map(item => ({
      name: item.name.trim(),
      amount: new Prisma.Decimal(item.amount.toFixed(2)),
      eventId: item.eventId,
      note: item.note?.trim() || null,
      createdById: session.userId || null
    }));

    await prisma.giftMoneyEntry.createMany({
      data: dataToInsert
    });

    // Audit Log for bulk creation
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "CREATE_GIFT_MONEY_ENTRY",
          entity: "GiftMoneyEntry",
          entityId: "bulk-import",
          oldValue: null,
          newValue: JSON.stringify({
            count: dataToInsert.length,
            eventId: entries[0]?.eventId,
            names: dataToInsert.map(d => d.name)
          })
        }
      });
    } catch (auditErr) {
      console.error("Failed to write bulk audit log:", auditErr);
    }

    revalidatePath("/admin/gift-money");
    return { success: true, count: dataToInsert.length };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to bulk import gift money entries." };
  }
}

export async function logPdfExportAction(filter: string, count: number, totalAmount: number) {
  try {
    const session = await requirePermission(PERMISSIONS.GIFT_MONEY_EXPORT);

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "EXPORT_GIFT_MONEY_PDF",
        entity: "GiftMoneyEntry",
        entityId: "export-pdf",
        oldValue: null,
        newValue: JSON.stringify({
          filter,
          count,
          totalAmount
        })
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to log PDF export:", error);
    return { success: false, error: error.message };
  }
}
