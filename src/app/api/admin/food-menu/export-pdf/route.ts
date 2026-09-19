import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

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
              orderBy: { sortOrder: 'asc' }
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
    
    // Add custom font for Sinhala support
    try {
      const fontPath = path.join(process.cwd(), 'public/fonts/NotoSansSinhala-Regular.ttf');
      const fontBase64 = fs.readFileSync(fontPath).toString('base64');
      doc.addFileToVFS('NotoSansSinhala.ttf', fontBase64);
      doc.addFont('NotoSansSinhala.ttf', 'NotoSansSinhala', 'normal');
      doc.addFont('NotoSansSinhala.ttf', 'NotoSansSinhala', 'bold');
    } catch (err) {
      console.warn("Could not load NotoSansSinhala font", err);
    }

    const defaultFont = "NotoSansSinhala";

    // Brand Colors
    const primaryColor = "#10233B"; // Deep Navy
    const accentColor = "#D7B56D"; // Champagne Gold
    const textColor = "#1F2937";

    let currentY = 40;

    // Header
    doc.setFont(defaultFont, "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("CHATHURYA & OSHADI", 40, currentY);
    currentY += 18;

    doc.setFont(defaultFont, "normal");
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

    if (menu.venue) {
      doc.text(`Venue: ${menu.venue}`, 40, currentY);
      currentY += 15;
    }

    if (menu.vendor) {
      doc.text(`Caterer: ${menu.vendor.vendorName}`, 40, currentY);
      currentY += 15;
    }
    
    currentY += 10;

    // Prepare table columns based on simplified requirements
    const tableColumns = ["Item"];

    // Sections
    menu.sections.forEach((section: any) => {
      doc.setFontSize(12);
      doc.setFont(defaultFont, "bold");
      doc.setTextColor(primaryColor);
      doc.text(section.title.toUpperCase(), 40, currentY + 15);
      currentY += 25;

      const rows = section.items.map((item: any) => {
        return [item.name];
      });

      if (rows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [], // No table headers needed for a simple list
          body: rows,
          theme: "plain",
          styles: {
            font: defaultFont,
          },
          bodyStyles: {
            fontSize: 10,
            textColor: textColor,
            lineColor: [230, 230, 230],
            lineWidth: { bottom: 0.5 }, // only bottom border for clean look
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
        doc.setFont(defaultFont, "normal");
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
