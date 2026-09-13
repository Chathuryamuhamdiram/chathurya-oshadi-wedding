import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function POST(request: Request) {
  try {
    // 1. Authenticate and Authorize
    const session = await requirePermission(PERMISSIONS.GUEST_EXPORT);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const {
      activeEventId,
      isAllEvents,
      searchQuery,
      sideTab,
      rsvpFilter,
      sendFilter,
      sortBy,
      columns
    } = await request.json();

    // Verify Liquor Count Permission
    const canViewLiquor = hasPermission(session.role, session.permissions || [], PERMISSIONS.GUEST_VIEW) || session.role === "SUPER_ADMIN";
    const includeLiquor = columns.includeLiquorCount && canViewLiquor;
    
    // Verify Invitation Code Permission
    const canViewCode = session.role === "SUPER_ADMIN";
    const includeCode = columns.includeInvitationCode && canViewCode;

    // 2. Fetch Data (Mirroring Client-Side logic but doing the DB fetch)
    const rawGuests = await prisma.guest.findMany({
      include: {
        eventGuests: {
          include: { event: { select: { id: true, name: true, eventType: true } } }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    let result = isAllEvents 
      ? rawGuests 
      : rawGuests.filter(g => g.eventGuests.some(eg => eg.eventId === activeEventId) || g.eventGuests.length === 0);

    // Apply Filters (same as client-side)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.displayName.toLowerCase().includes(q) ||
          (g.whatsappNumber && g.whatsappNumber.includes(q)) ||
          g.invitationCode.toLowerCase().includes(q)
      );
    }

    if (sideTab !== "ALL") {
      result = result.filter((g) => g.side === sideTab);
    }

    if (rsvpFilter !== "ALL") {
      result = result.filter((g) => g.rsvpStatus === rsvpFilter);
    }

    if (sendFilter !== "ALL") {
      const targetSend = sendFilter === "SENT";
      result = result.filter((g) => {
        const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
        const isSent = eg ? eg.send : false;
        return isSent === targetSend;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "NAME_AZ": return a.displayName.localeCompare(b.displayName);
        case "NAME_ZA": return b.displayName.localeCompare(a.displayName);
        case "GROOM_FIRST":
          if (a.side === "GROOM" && b.side !== "GROOM") return -1;
          if (a.side !== "GROOM" && b.side === "GROOM") return 1;
          return 0;
        case "BRIDE_FIRST":
          if (a.side === "BRIDE" && b.side !== "BRIDE") return -1;
          if (a.side !== "BRIDE" && b.side === "BRIDE") return 1;
          return 0;
        case "RSVP_CONFIRMED_FIRST":
          if (a.rsvpStatus === "ATTENDING" && b.rsvpStatus !== "ATTENDING") return -1;
          if (a.rsvpStatus !== "ATTENDING" && b.rsvpStatus === "ATTENDING") return 1;
          return 0;
        case "RSVP_PENDING_FIRST":
          if (a.rsvpStatus === "PENDING" && b.rsvpStatus !== "PENDING") return -1;
          if (a.rsvpStatus !== "PENDING" && b.rsvpStatus === "PENDING") return 1;
          return 0;
        case "SENT_FIRST":
        case "NOT_SENT_FIRST":
          const egA = a.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const egB = b.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
          const sendA = egA ? egA.send : false;
          const sendB = egB ? egB.send : false;
          if (sortBy === "SENT_FIRST") return sendA === sendB ? 0 : sendA ? -1 : 1;
          return sendA === sendB ? 0 : sendA ? 1 : -1;
        case "SEATS_HIGH_LOW": return b.allowedGuestCount - a.allowedGuestCount;
        case "LIQUOR_HIGH_LOW": return b.liquorCount - a.liquorCount;
        case "RECENTLY_ADDED":
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    if (result.length === 0) {
       return new NextResponse("No guests match the current filters.", { status: 400 });
    }

    // 3. Generate PDF
    const totalCols = 2 + (columns.includePhone ? 1 : 0) + (columns.includeType ? 1 : 0) + 
      (columns.includeAllowed ? 1 : 0) + (columns.includeConfirmed ? 1 : 0) + 
      (columns.includeRsvp ? 1 : 0) + (columns.includeSend ? 1 : 0) + 
      (includeLiquor ? 1 : 0) + (includeCode ? 1 : 0) + (isAllEvents ? 1 : 0);
    
    const orientation = totalCols > 6 ? "landscape" : "portrait";
    const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
    
    // Helper colors
    const primaryColor = "#10233B"; // Deep Navy
    const accentColor = "#D7B56D"; // Champagne Gold
    const textColor = "#1F2937";
    
    // Calculate Summaries
    const totalInvitations = result.length;
    const totalAllowed = result.reduce((acc, g) => acc + g.allowedGuestCount, 0);
    const totalConfirmed = result.reduce((acc, g) => acc + g.confirmedGuestCount, 0);
    const totalLiquorCount = result.reduce((acc, g) => acc + g.liquorCount, 0);
    const pendingCount = result.filter(g => g.rsvpStatus === "PENDING").length;
    const declinedCount = result.filter(g => g.rsvpStatus === "NOT_ATTENDING").length;

    let sendCount = 0;
    let notSentCount = 0;
    result.forEach(g => {
       const eg = g.eventGuests.find(eg => isAllEvents || eg.eventId === activeEventId);
       if (eg && eg.send) sendCount++; else notSentCount++;
    });

    const drawHeaderAndSummary = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text("CHATHURYA & OSHADI", 40, 40);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(accentColor);
      doc.text("GUEST LIST", 40, 58);

      // Context
      doc.setFontSize(9);
      doc.setTextColor(textColor);
      let contextY = 80;
      
      const eventName = isAllEvents ? "All Events" : (result[0]?.eventGuests.find(eg => eg.eventId === activeEventId)?.event.name || "Selected Event");
      doc.text(`Event: ${eventName}`, 40, contextY);
      doc.text(`Guest Side: ${sideTab === "ALL" ? "Both" : sideTab === "BRIDE" ? "Bride" : "Groom"}`, 180, contextY);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 320, contextY);

      // Summary Box
      contextY += 20;
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 248); // Warm Ivory
      doc.roundedRect(40, contextY, orientation === 'landscape' ? 760 : 515, 60, 3, 3, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      
      const summaryItems = [
        `Total Invitations: ${totalInvitations}`,
        `Total Invited Guests: ${totalAllowed}`,
        `Confirmed Guests: ${totalConfirmed}`,
        `Pending RSVP: ${pendingCount}`,
        `Declined: ${declinedCount}`
      ];
      
      if (includeLiquor) {
        summaryItems.push(`Total Liquor Count: ${totalLiquorCount}`);
      }
      
      if (columns.includeSend) {
        summaryItems.push(`Sent: ${sendCount}`);
        summaryItems.push(`Not Sent: ${notSentCount}`);
      }

      let sx = 50;
      let sy = contextY + 15;
      
      summaryItems.forEach((item, idx) => {
        doc.text(item, sx, sy);
        sx += 120;
        if (sx > (orientation === 'landscape' ? 700 : 450)) {
           sx = 50;
           sy += 15;
        }
      });
      
      return contextY + 70;
    };

    let currentY = drawHeaderAndSummary();

    // Table setup
    const tableColumns = ["#", "Guest / Family Name", "Side"];
    if (isAllEvents) tableColumns.push("Event");
    if (columns.includeType) tableColumns.push("Type");
    if (columns.includeAllowed) tableColumns.push("Invited");
    if (columns.includeConfirmed) tableColumns.push("Confirmed");
    if (includeLiquor) tableColumns.push("Liquor");
    if (columns.includeRsvp) tableColumns.push("RSVP");
    if (columns.includeSend) tableColumns.push("Sent");
    if (columns.includePhone) tableColumns.push("Phone");
    if (includeCode) tableColumns.push("Code");

    const getRowData = (guests: any[]) => guests.map((g, idx) => {
      const row = [
        (idx + 1).toString(),
        g.displayName,
        g.side === "BRIDE" ? "Bride" : g.side === "GROOM" ? "Groom" : "Both"
      ];
      
      if (isAllEvents) {
        const events = g.eventGuests.map((eg: any) => eg.event.name).join(", ");
        row.push(events || "-");
      }
      
      if (columns.includeType) row.push(g.invitationType === "FAMILY" ? "Family" : "Individual");
      if (columns.includeAllowed) row.push(g.allowedGuestCount.toString());
      if (columns.includeConfirmed) row.push(g.confirmedGuestCount.toString());
      
      if (includeLiquor) {
        row.push(g.liquorCount === null ? "-" : g.liquorCount.toString());
      }
      
      if (columns.includeRsvp) {
        const status = g.rsvpStatus === "ATTENDING" ? "Confirmed" : 
                       g.rsvpStatus === "NOT_ATTENDING" ? "Declined" : 
                       g.rsvpStatus === "PENDING" ? "Pending" : "Not Sure";
        row.push(status);
      }
      
      if (columns.includeSend) {
        const eg = g.eventGuests.find((eg: any) => isAllEvents || eg.eventId === activeEventId);
        row.push(eg?.send ? "Yes" : "No");
      }
      
      if (columns.includePhone) row.push(g.whatsappNumber || "-");
      if (includeCode) row.push(g.invitationCode);
      
      return row;
    });

    const drawTable = (data: any[], startY: number, title?: string) => {
      if (data.length === 0) return startY;
      
      if (title) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text(title, 40, startY + 15);
        startY += 25;
      }

      autoTable(doc, {
        startY,
        head: [tableColumns],
        body: data,
        theme: "plain",
        headStyles: {
          fillColor: primaryColor,
          textColor: "#ffffff",
          fontStyle: "bold",
          fontSize: 9,
          halign: "left"
        },
        bodyStyles: {
          fontSize: 8,
          textColor: textColor,
          lineColor: [230, 230, 230],
          lineWidth: 0.5,
        },
        alternateRowStyles: {
          fillColor: [252, 252, 250]
        },
        margin: { top: 40, left: 40, right: 40, bottom: 40 },
        didDrawPage: (data) => {
          // Footer with page number
          const str = `Chathurya & Oshadi Wedding Platform - Page ${doc.getCurrentPageInfo().pageNumber}`;
          doc.setFontSize(8);
          doc.setTextColor(150);
          const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 20);
        }
      });
      
      return (doc as any).lastAutoTable.finalY + 20;
    };

    // Grouping Logic
    if (isAllEvents) {
      // Group by event
      const weddingGuests = result.filter(g => g.eventGuests.some((eg: any) => eg.event.eventType === "WEDDING"));
      const homecomingGuests = result.filter(g => g.eventGuests.some((eg: any) => eg.event.eventType === "HOMECOMING"));
      
      if (sideTab === "ALL") {
        const wBride = weddingGuests.filter(g => g.side === "BRIDE" || g.side === "BOTH");
        const wGroom = weddingGuests.filter(g => g.side === "GROOM" || g.side === "BOTH");
        
        currentY = drawTable(getRowData(wBride), currentY, "WEDDING - BRIDE GUESTS");
        currentY = drawTable(getRowData(wGroom), currentY, "WEDDING - GROOM GUESTS");
        
        const hBride = homecomingGuests.filter(g => g.side === "BRIDE" || g.side === "BOTH");
        const hGroom = homecomingGuests.filter(g => g.side === "GROOM" || g.side === "BOTH");
        
        currentY = drawTable(getRowData(hBride), currentY, "HOMECOMING - BRIDE GUESTS");
        drawTable(getRowData(hGroom), currentY, "HOMECOMING - GROOM GUESTS");
      } else {
        currentY = drawTable(getRowData(weddingGuests), currentY, "WEDDING GUESTS");
        drawTable(getRowData(homecomingGuests), currentY, "HOMECOMING GUESTS");
      }
    } else {
      if (sideTab === "ALL") {
        const brideGuests = result.filter(g => g.side === "BRIDE" || g.side === "BOTH");
        const groomGuests = result.filter(g => g.side === "GROOM" || g.side === "BOTH");
        
        currentY = drawTable(getRowData(brideGuests), currentY, "BRIDE GUESTS");
        drawTable(getRowData(groomGuests), currentY, "GROOM GUESTS");
      } else {
        drawTable(getRowData(result), currentY);
      }
    }

    // 4. Return PDF
    const pdfBytes = doc.output("arraybuffer");
    
    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "GUEST_LIST_PDF_EXPORT",
          entity: "Guest",
          entityId: "export",
          oldValue: null,
          newValue: JSON.stringify({ 
            event: isAllEvents ? "ALL" : activeEventId,
            side: sideTab,
            count: result.length,
            includedLiquor: includeLiquor
          }),
        }
      });
    } catch (e) {
      console.warn("Could not create audit log for export", e);
    }

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="guest-list.pdf"`,
      }
    });

  } catch (error: any) {
    console.error("PDF Export error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
