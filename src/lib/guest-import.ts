import { prisma } from "@/lib/db";
import { z } from "zod";

// --- Phone Normalization ---
export function normalizePhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9) return null;
  return digits.slice(-9); // canonical format used in lookup
}

// --- Import Types ---

export type GuestImportContext = {
  eventId: string;
  side: "BRIDE" | "GROOM" | "BOTH";
};

export type RowClassification = 
  | "NEW" 
  | "UPDATE" 
  | "DUPLICATE" 
  | "CONFLICT" 
  | "OTHER_EVENT" 
  | "OTHER_SIDE" 
  | "INVALID";

export type ImportRow = {
  index: number; // original row number in Excel
  guestName: string; // Maps to Display Name
  invitationType: "INDIVIDUAL" | "FAMILY"; // Maps to Type
  allowedGuestCount: number; // Maps to Allowed Seats
  liquorCount: number;
  whatsappNumber?: string | null;
  email?: string | null;
};

export type ProcessedRow = {
  classification: RowClassification;
  row: ImportRow;
  existingId?: string; // If matched to an existing guest
  changes?: string; // Summary of changes for UPDATE or reason for CONFLICT/INVALID
};

// Zod schema for validating raw excel rows
export const excelRowSchema = z.object({
  "Display Name": z.string().min(1, "Display Name is required"),
  "Type": z.enum(["INDIVIDUAL", "FAMILY"]).catch("INDIVIDUAL" as any),
  "Allowed Seats": z.coerce.number().min(1, "Must be at least 1"),
  "Liquor Count": z.coerce.number().catch(0),
  "WhatsApp Number": z.coerce.string().optional().nullable(),
  "Email Address": z.string().email("Invalid email").optional().nullable().or(z.literal("")),
});

// --- Main Engine ---

export async function processGuestImport(
  context: GuestImportContext, 
  rawRows: any[]
): Promise<ProcessedRow[]> {
  const processedRows: ProcessedRow[] = [];
  const normalizedPhonesInImport = new Set<string>();

  // Extract valid rows and valid phones
  const validRows = rawRows.map((raw, idx) => {
    try {
      const parsed = excelRowSchema.parse(raw);
      const phone = parsed["WhatsApp Number"] ? String(parsed["WhatsApp Number"]) : null;
      const normalizedPhone = normalizePhone(phone);
      
      const row: ImportRow = {
        index: idx + 2, // Accounting for header row (assuming 1-based index in UI)
        guestName: parsed["Display Name"],
        invitationType: parsed["Type"] as any,
        allowedGuestCount: parsed["Allowed Seats"],
        liquorCount: parsed["Liquor Count"],
        whatsappNumber: phone,
        email: parsed["Email Address"],
      };

      if (normalizedPhone) {
        normalizedPhonesInImport.add(normalizedPhone);
      }

      return { row, normalizedPhone };
    } catch (error: any) {
      processedRows.push({
        classification: "INVALID",
        row: { index: idx + 2 } as any, // partial row just for index
        changes: error.issues ? error.issues.map((i: any) => i.message).join(", ") : "Invalid row format",
      });
      return null;
    }
  }).filter(Boolean) as { row: ImportRow, normalizedPhone: string | null }[];

  // Bulk query existing guests using normalized phones (if any) or exact names (fallback)
  const phoneArray = Array.from(normalizedPhonesInImport);
  const nameArray = validRows.map(r => r.row.guestName);

  // We find guests that match either the phone OR the exact name.
  // Phone matching is the primary key for contact matching. Name matching is secondary.
  const existingGuests = await prisma.guest.findMany({
    where: {
      OR: [
        ...phoneArray.map(p => ({ whatsappNumber: { endsWith: p } })),
        { displayName: { in: nameArray } }
      ]
    },
    include: {
      eventGuests: { select: { eventId: true } }
    }
  });

  // Classification loop
  for (const { row, normalizedPhone } of validRows) {
    // Priority 1: Match by normalized phone
    // Priority 2: Match by exact name
    const match = existingGuests.find(g => 
      (normalizedPhone && g.whatsappNumber && normalizePhone(g.whatsappNumber) === normalizedPhone) ||
      (g.displayName.toLowerCase().trim() === row.guestName.toLowerCase().trim())
    );

    if (!match) {
      processedRows.push({ classification: "NEW", row });
      continue;
    }

    // A match exists. Determine context.
    const isInEvent = match.eventGuests.some(eg => eg.eventId === context.eventId);
    
    if (!isInEvent) {
      processedRows.push({ 
        classification: "OTHER_EVENT", 
        row, 
        existingId: match.id,
        changes: `Exists in another event. Action will add to ${context.eventId}.` 
      });
      continue;
    }

    // In same event. Check side.
    if (match.side !== context.side && match.side !== "BOTH") {
      processedRows.push({ 
        classification: "OTHER_SIDE", 
        row, 
        existingId: match.id,
        changes: `Exists in same event but on ${match.side} side. Requires manual review.` 
      });
      continue;
    }

    // Exact match in same event + same side (or BOTH). 
    // Check for RSVP conflict
    if (match.confirmedGuestCount > row.allowedGuestCount) {
      processedRows.push({
        classification: "CONFLICT",
        row,
        existingId: match.id,
        changes: `Cannot reduce allowed guests (${row.allowedGuestCount}) below confirmed guests (${match.confirmedGuestCount}).`
      });
      continue;
    }

    // Check if it's an UPDATE or a DUPLICATE
    const isIdentical = 
      match.displayName === row.guestName &&
      match.invitationType === row.invitationType &&
      match.allowedGuestCount === row.allowedGuestCount &&
      match.liquorCount === row.liquorCount &&
      (match.whatsappNumber || "") === (row.whatsappNumber || "") &&
      (match.email || "") === (row.email || "");

    if (isIdentical) {
      processedRows.push({ classification: "DUPLICATE", row, existingId: match.id, changes: "Identical to existing record." });
    } else {
      // Build a summary of changes
      const changesList: string[] = [];
      if (match.displayName !== row.guestName) changesList.push(`Name: ${match.displayName} → ${row.guestName}`);
      if (match.allowedGuestCount !== row.allowedGuestCount) changesList.push(`Allowed: ${match.allowedGuestCount} → ${row.allowedGuestCount}`);
      if (match.liquorCount !== row.liquorCount) changesList.push(`Liquor: ${match.liquorCount} → ${row.liquorCount}`);
      if (match.invitationType !== row.invitationType) changesList.push(`Type: ${match.invitationType} → ${row.invitationType}`);
      if ((match.whatsappNumber || "") !== (row.whatsappNumber || "")) changesList.push(`Phone: ${match.whatsappNumber || "none"} → ${row.whatsappNumber || "none"}`);
      
      processedRows.push({ 
        classification: "UPDATE", 
        row, 
        existingId: match.id,
        changes: changesList.length > 0 ? changesList.join(" | ") : "Metadata updated"
      });
    }
  }

  return processedRows;
}
