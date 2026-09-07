import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export async function GET() {
  try {
    const wb = xlsx.utils.book_new();

    // Sheet 1: Guests
    const guestHeaders = [
      "Guest Name",
      "Invitation Type",
      "Allowed Guest Count",
      "WhatsApp Number",
      "Email",
      "Primary Contact Name",
      "Notes",
    ];

    const guestData = [
      guestHeaders,
      [
        "John Doe",
        "INDIVIDUAL",
        1,
        "0712345678",
        "john@example.com",
        "John",
        "University friend",
      ],
      [
        "Smith Family",
        "FAMILY",
        4,
        "0771234567",
        "smith@example.com",
        "Jane Smith",
        "Close relatives",
      ],
    ];

    const wsGuests = xlsx.utils.aoa_to_sheet(guestData);

    // Style the header row slightly (basic styling, full styling requires Pro)
    const colWidths = [
      { wch: 25 }, // Guest Name
      { wch: 15 }, // Type
      { wch: 20 }, // Allowed Count
      { wch: 15 }, // WhatsApp
      { wch: 25 }, // Email
      { wch: 20 }, // Primary Contact
      { wch: 30 }, // Notes
    ];
    wsGuests["!cols"] = colWidths;

    xlsx.utils.book_append_sheet(wb, wsGuests, "Guests");

    // Sheet 2: Instructions
    const instructionsData = [
      ["Instructions for Guest Import"],
      [""],
      ["1. One row represents ONE invitation. For families, use a single row and set Invitation Type to 'FAMILY' and Allowed Guest Count to the total number of people invited."],
      ["2. Allowed Guest Count must be a positive whole number."],
      ["3. WhatsApp Number is highly recommended. Ensure it is correct (e.g., 0712345678)."],
      ["4. Do not rename or remove the column headers in the 'Guests' sheet."],
      ["5. Event and Guest Side are selected in the web interface before uploading, do not add them here."],
      ["6. Only 'INDIVIDUAL' and 'FAMILY' are valid Invitation Types."],
    ];

    const wsInstructions = xlsx.utils.aoa_to_sheet(instructionsData);
    wsInstructions["!cols"] = [{ wch: 120 }];
    xlsx.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Guest_Import_Template.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return new NextResponse("Error generating template", { status: 500 });
  }
}
