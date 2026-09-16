import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.CALENDAR_VIEW);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    const event = await prisma.ceremonyEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const planItems = await prisma.eventPlanItem.findMany({
      where: { eventId },
      orderBy: { sortOrder: 'asc' }
    });

    // Generate PDF
    const doc = new jsPDF();
    
    const NAVY = [16, 35, 59];
    const GOLD = [215, 181, 109];
    const IVORY = [248, 242, 232];

    // Header Background
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(0, 0, 210, 45, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CHATHURYA & OSHADI", 105, 20, { align: "center" });
    
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`${event.name.toUpperCase()} DAY PLAN`, 105, 30, { align: "center" });

    if (event.eventDate) {
      doc.setFontSize(11);
      doc.text(new Date(event.eventDate).toLocaleDateString('en-GB', { 
        day: '2-digit', month: 'long', year: 'numeric' 
      }).toUpperCase(), 105, 38, { align: "center" });
    }

    // Content Table
    const tableData = planItems.map((item, index) => [
      (index + 1).toString().padStart(2, '0'),
      item.activity,
      item.plannedTime || "—"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [], // No table headers requested in design
      body: tableData,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 12,
        textColor: NAVY as any,
        cellPadding: 6,
      },
      columnStyles: {
        0: { cellWidth: 20, textColor: [150, 150, 150] as any, fontStyle: 'bold' },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
        2: { cellWidth: 40, halign: 'right', textColor: GOLD as any, fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: IVORY as any
      },
      margin: { left: 15, right: 15 }
    });

    const pdfBuffer = doc.output('arraybuffer');
    const safeName = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${safeName}-event-plan.pdf`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
