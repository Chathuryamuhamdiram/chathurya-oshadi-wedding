import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GiftMoneyItem, EventFilterType } from "./types";
import { formatLKR } from "./utils";

interface ExportPdfOptions {
  entries: GiftMoneyItem[];
  filter: EventFilterType;
  weddingTotal: number;
  homecomingTotal: number;
  grandTotal: number;
}

export function generateGiftMoneyPdf({
  entries,
  filter,
  weddingTotal,
  homecomingTotal,
  grandTotal,
}: ExportPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();

  // Wedding Palette
  const deepNavy = "#10233B";
  const champagneGold = "#D7B56D";
  const warmIvory = "#F8F2E8";
  const charcoalText = "#1E293B";
  const lightGrayBorder = [226, 232, 240];

  // 1. Draw Title Header on Page 1
  // Header background bar or minimalist gold line
  doc.setDrawColor(215, 181, 109); // Champagne Gold
  doc.setLineWidth(1.5);
  doc.line(40, 32, pageWidth - 40, 32);

  // Main Monogram / Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(deepNavy);
  doc.text("CHATHURYA & OSHADI", 40, 52);

  // Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(champagneGold);
  doc.text("GIFT MONEY REGISTER", 40, 68);

  // Filter Badge & Meta Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(deepNavy);

  let filterLabel = "ALL EVENTS";
  if (filter === "WEDDING") filterLabel = "WEDDING";
  if (filter === "HOMECOMING") filterLabel = "HOMECOMING";

  // Event context tag
  doc.setFillColor(248, 242, 232); // Warm Ivory
  doc.setDrawColor(215, 181, 109);
  doc.roundedRect(pageWidth - 160, 42, 120, 20, 3, 3, "FD");
  doc.setTextColor(deepNavy);
  doc.text(filterLabel, pageWidth - 100, 55, { align: "center" });

  // Generation timestamp & record count
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${dateStr}  •  ${entries.length} Record${entries.length === 1 ? "" : "s"}`, 40, 84);

  // Thin separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.75);
  doc.line(40, 92, pageWidth - 40, 92);

  // 2. Table Data
  const tableData = entries.map((item, index) => [
    (index + 1).toString(),
    item.name,
    item.event.eventType === "WEDDING" ? "Wedding" : "Homecoming",
    formatLKR(item.amount),
    item.note ? item.note : "—",
  ]);

  // If no rows, show an empty row placeholder
  if (tableData.length === 0) {
    tableData.push(["—", "No gift money entries found for this filter.", "—", "—", "—"]);
  }

  // 3. Render Table
  autoTable(doc, {
    startY: 104,
    head: [["No.", "Person / Guest Name", "Event", "Amount", "Note"]],
    body: tableData,
    theme: "plain",
    showHead: "everyPage",
    margin: { top: 40, left: 40, right: 40, bottom: 50 },
    headStyles: {
      fillColor: deepNavy,
      textColor: "#ffffff",
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
      cellPadding: { top: 7, bottom: 7, left: 6, right: 6 },
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: charcoalText,
      lineColor: lightGrayBorder as any,
      lineWidth: 0.5,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 32, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 160, fontStyle: "bold" },
      2: { cellWidth: 85, halign: "center" },
      3: { cellWidth: 105, halign: "right", fontStyle: "bold", textColor: deepNavy },
      4: { cellWidth: "auto" },
    },
  });

  // 4. Render Summary / Totals Box at the end
  const finalY = (doc as any).lastAutoTable?.finalY || 120;
  const boxHeight = filter === "ALL" ? 85 : 55;
  const bottomMargin = 55;

  let totalsY = finalY + 15;
  // If not enough room on current page, add new page
  if (totalsY + boxHeight > pageHeight - bottomMargin) {
    doc.addPage();
    totalsY = 45;
  }

  const boxWidth = 240;
  const boxX = pageWidth - 40 - boxWidth;

  // Box Background
  doc.setFillColor(248, 242, 232); // Warm Ivory #F8F2E8
  doc.setDrawColor(215, 181, 109); // Champagne Gold #D7B56D
  doc.setLineWidth(1);
  doc.roundedRect(boxX, totalsY, boxWidth, boxHeight, 4, 4, "FD");

  // Box Inner Gold Accent Bar
  doc.setFillColor(215, 181, 109);
  doc.roundedRect(boxX, totalsY, 4, boxHeight, 2, 2, "F");

  // Box Content
  let lineY = totalsY + 18;
  const labelX = boxX + 16;
  const valueX = boxX + boxWidth - 16;

  if (filter === "WEDDING") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(charcoalText);
    doc.text("Wedding Total:", labelX, lineY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(deepNavy);
    doc.text(formatLKR(weddingTotal), valueX, lineY, { align: "right" });
  } else if (filter === "HOMECOMING") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(charcoalText);
    doc.text("Homecoming Total:", labelX, lineY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(deepNavy);
    doc.text(formatLKR(homecomingTotal), valueX, lineY, { align: "right" });
  } else {
    // ALL Events
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(charcoalText);
    doc.text("Wedding Total:", labelX, lineY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(deepNavy);
    doc.text(formatLKR(weddingTotal), valueX, lineY, { align: "right" });

    lineY += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(charcoalText);
    doc.text("Homecoming Total:", labelX, lineY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(deepNavy);
    doc.text(formatLKR(homecomingTotal), valueX, lineY, { align: "right" });

    lineY += 10;
    doc.setDrawColor(215, 181, 109);
    doc.setLineWidth(0.5);
    doc.line(labelX, lineY, valueX, lineY);

    lineY += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(deepNavy);
    doc.text("Grand Total:", labelX, lineY);
    doc.setFontSize(11);
    doc.setTextColor(champagneGold);
    doc.text(formatLKR(grandTotal), valueX, lineY, { align: "right" });
  }

  // 5. Add Page Number Footers to ALL Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400

    // Footer bottom separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 32, pageWidth - 40, pageHeight - 32);

    // Left: Platform name
    doc.text("Chathurya & Oshadi • Gift Money Register", 40, pageHeight - 20);

    // Right: Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 20, { align: "right" });
  }

  // 6. Filename
  let filename = "gift-money-register-all.pdf";
  if (filter === "WEDDING") filename = "wedding-gift-money-register.pdf";
  if (filter === "HOMECOMING") filename = "homecoming-gift-money-register.pdf";

  // Trigger browser download
  doc.save(filename);
}
