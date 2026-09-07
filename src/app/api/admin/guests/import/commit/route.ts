import { NextResponse } from "next/server";
import { requirePermission, getAdminSession } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ProcessedRow } from "@/lib/guest-import";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    let session = await requirePermission(PERMISSIONS.GUEST_IMPORT).catch(() => null);
    
    if (!session) {
      session = await getAdminSession();
      if (!session || session.role !== "SUPER_ADMIN") {
         return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
      }
    }

    const body = await req.json();
    const { eventId, side, operations } = body as { eventId: string, side: string, operations: ProcessedRow[] };

    if (!eventId || !side || !operations || !Array.isArray(operations)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let conflicts = 0;

    // Use a transaction for the entire import batch
    await prisma.$transaction(async (tx) => {
      for (const op of operations) {
        try {
          const { classification, row, existingId } = op;

          if (classification === "NEW" || classification === "OTHER_EVENT" || classification === "OTHER_SIDE") {
            // Check if we are attaching to an existing guest or creating a brand new one
            let guestId = existingId;
            
            if (!guestId) {
              // Create completely new Guest
              const newGuest = await tx.guest.create({
                data: {
                  displayName: row.guestName,
                  invitationType: row.invitationType,
                  allowedGuestCount: row.allowedGuestCount,
                  whatsappNumber: row.whatsappNumber,
                  email: row.email,
                  side: side,
                  invitationCode: nanoid(8).toUpperCase(),
                  rsvpStatus: "PENDING",
                  invitationStatus: "NOT_SENT",
                  confirmedGuestCount: 0,
                  liquorCount: row.liquorCount || 0,
                }
              });
              guestId = newGuest.id;
            }

            // Link to the Event
            await tx.eventGuest.upsert({
              where: { guestId_eventId: { guestId, eventId } },
              create: { guestId, eventId, rsvpStatus: "PENDING" },
              update: {} // If it somehow already existed, do nothing
            });

            created++;
          } 
          else if (classification === "UPDATE" && existingId) {
            // Re-validate RSVP safety
            const existing = await tx.guest.findUnique({ where: { id: existingId } });
            if (existing && existing.confirmedGuestCount > row.allowedGuestCount) {
              conflicts++;
              failed++;
              continue;
            }

            // Update Guest
            await tx.guest.update({
              where: { id: existingId },
              data: {
                displayName: row.guestName,
                invitationType: row.invitationType,
                allowedGuestCount: row.allowedGuestCount,
                whatsappNumber: row.whatsappNumber,
                email: row.email,
                liquorCount: row.liquorCount,
              }
            });

            updated++;
          }
          else {
            skipped++;
          }
        } catch (err) {
          console.error("Row import error:", err);
          failed++;
        }
      }
      
      // Create Audit Log
      await tx.auditLog.create({
        data: {
          action: "GUEST_EXCEL_IMPORT",
          entity: "Guest",
          userId: session.userId,
          newValue: JSON.stringify({
            eventId,
            side,
            created,
            updated,
            skipped,
            failed,
            conflicts,
            totalRowsProcessed: operations.length
          }),
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      summary: { created, updated, skipped, failed, conflicts } 
    });

  } catch (error: any) {
    console.error("Commit import error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to commit import" }, { status: 500 });
  }
}
