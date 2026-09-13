import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.MENU_EXPORT);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    
    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 });
    }

    const includeDescriptions = searchParams.get("includeDescriptions") === "true";
    const includeSectionHeadings = searchParams.get("includeSectionHeadings") === "true";
    const includeVenue = searchParams.get("includeVenue") === "true";
    const includeCaterer = searchParams.get("includeCaterer") === "true";
    
    // Financial and internal data requires specific permissions
    const canViewCosts = session.role === "SUPER_ADMIN" || session.permissions?.includes(PERMISSIONS.MENU_EDIT);
    const includeCosts = canViewCosts && searchParams.get("includeCosts") === "true";
    const includeInternalNotes = canViewCosts && searchParams.get("includeInternalNotes") === "true";
    const includeItemStatus = canViewCosts && searchParams.get("includeItemStatus") === "true";

    // 1. Fetch Data
    const menu = await prisma.foodMenu.findFirst({
      where: { eventId },
      include: {
        event: true,
        vendor: true,
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              orderBy: { sortOrder: 'asc' },
              include: { vendor: true }
            }
          }
        }
      }
    });

    if (!menu) {
      return new NextResponse("Menu not found for this event", { status: 404 });
    }

    // 2. Generate PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    
    // Brand Colors
    const primaryColor = "#10233B"; // Deep Navy
    const accentColor = "#D7B56D"; // Champagne Gold
    const textColor = "#1F2937";

    let currentY = 40;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("CHATHURYA & OSHADI", 40, currentY);
    currentY += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(accentColor);
    doc.text("FOOD MENU", 40, currentY);
    currentY += 22;

    // Context Info
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    
    doc.text(`Event: ${menu.event?.name || 'Unknown'}`, 40, currentY);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 350, currentY);
    currentY += 15;
    
    if (menu.title) {
      doc.text(`Menu Title: ${menu.title}`, 40, currentY);
      currentY += 15;
    }

    if (includeVenue && menu.venue) {
      doc.text(`Venue: ${menu.venue}`, 40, currentY);
      currentY += 15;
    }

    if (includeCaterer && menu.vendor) {
      doc.text(`Caterer: ${menu.vendor.vendorName}`, 40, currentY);
      currentY += 15;
    }
    
    if (includeInternalNotes && menu.notes) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text(`Internal Notes: ${menu.notes}`, 40, currentY, { maxWidth: 515 });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor);
      currentY += 25;
    } else {
      currentY += 10;
    }

    // Prepare table columns based on options
    const tableColumns = ["Item"];
    if (includeDescriptions) tableColumns.push("Description");
    if (includeItemStatus) tableColumns.push("Status");
    if (includeCaterer) tableColumns.push("Vendor");
    if (includeCosts) tableColumns.push("Cost");

    // Sections
    menu.sections.forEach((section: any) => {
      if (includeSectionHeadings) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text(section.title.toUpperCase(), 40, currentY + 15);
        currentY += 25;
      }

      const rows = section.items.map((item: any) => {
        const row = [item.name];
        if (includeDescriptions) row.push(item.description || "-");
        if (includeItemStatus) row.push(item.status);
        if (includeCaterer) row.push(item.vendor?.vendorName || "-");
        
        if (includeCosts) {
          if (item.cost) {
            const costStr = `LKR ${item.cost}`;
            const typeStr = item.costType === "PER_PERSON" ? "/person" : item.costType === "PER_ITEM" ? "/item" : "";
            row.push(`${costStr} ${typeStr}`);
          } else {
            row.push("-");
          }
        }
        return row;
      });

      if (rows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [tableColumns],
          body: rows,
          theme: "plain",
          headStyles: {
            fillColor: primaryColor,
            textColor: "#ffffff",
            fontStyle: "bold",
            fontSize: 10,
            halign: "left"
          },
          bodyStyles: {
            fontSize: 9,
            textColor: textColor,
            lineColor: [230, 230, 230],
            lineWidth: 0.5,
          },
          alternateRowStyles: {
            fillColor: [252, 252, 250] // Warm Ivory
          },
          margin: { top: 40, left: 40, right: 40, bottom: 40 },
          didDrawPage: (data) => {
            const str = `Page ${doc.getCurrentPageInfo().pageNumber}`;
            doc.setFontSize(8);
            doc.setTextColor(150);
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 20);
          }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150);
        doc.text("No items in this section", 40, currentY);
        currentY += 25;
      }
    });

    // Output
    const pdfBytes = doc.output("arraybuffer");
    
    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "FOOD_MENU_PDF_EXPORT",
          entity: "FoodMenu",
          entityId: menu.id,
          oldValue: null,
          newValue: JSON.stringify({ 
            event: menu.eventId,
            includedCosts: includeCosts
          }),
        }
      });
    } catch (e) {
      console.warn("Could not create audit log for export", e);
    }

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${menu.title ? menu.title.toLowerCase().replace(/\s+/g, '-') : 'food-menu'}.pdf"`,
      }
    });

  } catch (error: any) {
    console.error("PDF Export error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
