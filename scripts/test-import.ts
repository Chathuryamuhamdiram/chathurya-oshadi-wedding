import { processGuestImport, GuestImportContext } from "../src/lib/guest-import";
import { prisma } from "../src/lib/db";

async function runTests() {
  console.log("=== Starting Dev Testing for Guest Importer ===");

  // 1. Setup Test Data
  console.log("1. Setting up test data...");
  const event = await prisma.ceremonyEvent.findFirst({ where: { eventType: "WEDDING" } });
  if (!event) {
    console.error("No wedding event found. Cannot test.");
    process.exit(1);
  }

  // Clear previous test guests
  await prisma.guest.deleteMany({
    where: { displayName: { startsWith: "[TEST]" } }
  });

  const testGuest = await prisma.guest.create({
    data: {
      displayName: "[TEST] Nimal Perera",
      invitationType: "INDIVIDUAL",
      allowedGuestCount: 3,
      confirmedGuestCount: 2, // He already confirmed 2 guests
      whatsappNumber: "0711112222", // Normalized to 711112222
      side: "BRIDE",
      invitationCode: "TESTCODE",
      rsvpStatus: "ATTENDING",
      invitationStatus: "SENT",
      liquorCount: 0,
    }
  });

  await prisma.eventGuest.create({
    data: {
      guestId: testGuest.id,
      eventId: event.id,
      rsvpStatus: "ATTENDING"
    }
  });

  console.log(`Created test guest: ${testGuest.displayName} with 3 allowed, 2 confirmed.`);

  const context: GuestImportContext = { eventId: event.id, side: "BRIDE" };

  // 2. Define Mock Excel Rows
  const mockRows = [
    {
      "Guest Name": "[TEST] New Guest",
      "Invitation Type": "FAMILY",
      "Allowed Guest Count": 4,
      "WhatsApp Number": "0773334444",
      "Email": "new@test.com"
    },
    {
      "Guest Name": "[TEST] Nimal Perera", // Same name
      "Invitation Type": "INDIVIDUAL",
      "Allowed Guest Count": 3,
      "WhatsApp Number": "0711112222", // Same phone -> DUPLICATE
    },
    {
      "Guest Name": "[TEST] Nimal Perera",
      "Invitation Type": "INDIVIDUAL",
      "Allowed Guest Count": 5, // Changed count -> UPDATE
      "WhatsApp Number": "+94711112222", // Different format, same normalized
    },
    {
      "Guest Name": "[TEST] Nimal Perera",
      "Invitation Type": "INDIVIDUAL",
      "Allowed Guest Count": 1, // Lower than confirmed (2) -> CONFLICT
      "WhatsApp Number": "0711112222",
    },
    {
      "Guest Name": "[TEST] Invalid",
      "Invitation Type": "UNKNOWN", // Invalid type -> INVALID
      "Allowed Guest Count": -1, // Invalid count -> INVALID
    }
  ];

  // 3. Run Process
  console.log("2. Running processGuestImport...");
  const results = await processGuestImport(context, mockRows);

  // 4. Evaluate Results
  console.log("3. Evaluating Results:");
  
  let passed = 0;
  let failed = 0;

  const check = (name: string, expected: string, originalIndex: number) => {
    // Excel row index is originalIndex + 2 (because of 1-based index + header row)
    const result = results.find(r => r.row.index === originalIndex + 2);
    const classification = result?.classification;
    if (classification === expected) {
      console.log(`✅ [PASS] ${name} -> ${classification}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${name} -> Expected ${expected}, got ${classification}`);
      console.log(`   Changes/Notes: ${result?.changes}`);
      failed++;
    }
  };

  check("Row 0: Completely new guest", "NEW", 0);
  check("Row 1: Identical guest", "DUPLICATE", 1);
  check("Row 2: Changed allowed count", "UPDATE", 2);
  check("Row 3: RSVP Conflict (lowered count below confirmed)", "CONFLICT", 3);
  check("Row 4: Invalid row data", "INVALID", 4);

  // Clean up
  console.log("4. Cleaning up test data...");
  await prisma.guest.deleteMany({
    where: { displayName: { startsWith: "[TEST]" } }
  });

  console.log(`\n=== Test Summary: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
