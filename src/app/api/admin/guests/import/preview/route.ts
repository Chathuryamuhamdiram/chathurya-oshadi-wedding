import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import * as xlsx from "xlsx";
import { processGuestImport, GuestImportContext } from "@/lib/guest-import";
import { getActiveEventId, ALL_EVENTS_VALUE } from "@/lib/event-context";

export async function POST(req: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.GUEST_IMPORT).catch(() => null);
    
    // Check SUPER_ADMIN or GUEST_IMPORT permission
    if (!session && req.headers.get("x-user-role") !== "SUPER_ADMIN") {
      const fallbackSession = await requirePermission(null as any).catch(() => null); // Quick check if logged in
      if (!fallbackSession || fallbackSession.role !== "SUPER_ADMIN") {
         return NextResponse.json({ success: false, error: "Unauthorized. Requires GUEST_IMPORT permission or SUPER_ADMIN role." }, { status: 403 });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const eventId = formData.get("eventId") as string;
    const side = formData.get("side") as "BRIDE" | "GROOM" | "BOTH";

    if (!file) return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    if (!eventId || eventId === ALL_EVENTS_VALUE) return NextResponse.json({ success: false, error: "Specific Event ID is required" }, { status: 400 });
    if (!side) return NextResponse.json({ success: false, error: "Guest side is required" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File exceeds 5MB limit." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const wb = xlsx.read(buffer, { type: "buffer" });
    
    if (!wb.SheetNames.includes("Guests")) {
      return NextResponse.json({ success: false, error: "Required sheet 'Guests' not found in workbook." }, { status: 400 });
    }

    const ws = wb.Sheets["Guests"];
    const rawData = xlsx.utils.sheet_to_json(ws, { defval: null });

    if (rawData.length > 2000) {
      return NextResponse.json({ success: false, error: "Exceeded maximum row limit of 2000." }, { status: 400 });
    }

    if (rawData.length === 0) {
      return NextResponse.json({ success: false, error: "File is empty." }, { status: 400 });
    }

    const context: GuestImportContext = { eventId, side };
    const processedRows = await processGuestImport(context, rawData);

    const summary = {
      total: processedRows.length,
      new: processedRows.filter(r => r.classification === "NEW").length,
      updates: processedRows.filter(r => r.classification === "UPDATE").length,
      duplicates: processedRows.filter(r => r.classification === "DUPLICATE").length,
      otherEvent: processedRows.filter(r => r.classification === "OTHER_EVENT").length,
      otherSide: processedRows.filter(r => r.classification === "OTHER_SIDE").length,
      conflicts: processedRows.filter(r => r.classification === "CONFLICT").length,
      invalid: processedRows.filter(r => r.classification === "INVALID").length,
    };

    return NextResponse.json({ success: true, summary, rows: processedRows, context });

  } catch (error: any) {
    console.error("Preview import error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to parse excel file" }, { status: 500 });
  }
}
