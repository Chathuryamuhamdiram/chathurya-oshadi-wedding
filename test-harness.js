const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runBackendTests() {
  console.log("=== STARTING BACKEND LOGIC & INTEGRATION TESTS ===");
  const results = [];

  function record(id, module, expected, pass, actual) {
    results.push({ id, module, expected, pass, actual });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${actual}`);
  }

  // Retrieve our test data
  const guestA = await prisma.guest.findUnique({ where: { invitationCode: 'TEST_FAM_A' } });
  const guestB = await prisma.guest.findUnique({ where: { invitationCode: 'TEST_IND_B' } });
  const superAdmin = await prisma.user.findUnique({ where: { email: 'superadmin@test.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const familyMemberA = await prisma.user.findUnique({ where: { email: 'familyA@test.com' } });

  // 10. RSVP Validation
  try {
    await prisma.guest.update({
      where: { id: guestA.id },
      data: { confirmedGuestCount: 4, liquorCount: 2, rsvpStatus: 'ATTENDING' }
    });
    record('RSVP-RULE-001', 'RSVP', 'Valid Family RSVP accepted', true, 'Successfully updated Guest A');
  } catch (e) {
    record('RSVP-RULE-001', 'RSVP', 'Valid Family RSVP accepted', false, e.message);
  }

  // 7. Guest Management
  // GUEST-004 - Duplicate Code (Prisma unique constraint test)
  try {
    await prisma.guest.create({
      data: {
        displayName: 'Duplicate Code',
        invitationType: 'INDIVIDUAL',
        allowedGuestCount: 1,
        whatsappNumber: '0700000000',
        invitationCode: 'TEST_FAM_A' // Same as Guest A
      }
    });
    record('GUEST-004', 'Guest Management', 'Duplicate invitation code rejected', false, 'Allowed duplicate code');
  } catch (e) {
    record('GUEST-004', 'Guest Management', 'Duplicate invitation code rejected', true, 'Caught unique constraint error');
  }

  // 17. Vendors
  // VENDOR-001 - Create Vendor
  let vendor;
  try {
    vendor = await prisma.vendor.create({
      data: { name: 'Test Vendor', category: 'PHOTOGRAPHY' }
    });
    record('VENDOR-001', 'Vendors', 'Saved', true, 'Created vendor successfully');
  } catch(e) {
    record('VENDOR-001', 'Vendors', 'Saved', false, e.message);
  }

  // VENDOR-004 - Vendor With Finance (Prevent Hard Delete)
  // We simulate linking an expense.
  let expense;
  try {
    const budgetItem = await prisma.budgetItem.create({
      data: { category: 'PHOTOGRAPHY', subCategory: 'Main Photographer', estimatedAmount: 1000 }
    });
    expense = await prisma.expense.create({
      data: {
        budgetItemId: budgetItem.id,
        vendorId: vendor.id,
        amount: 500,
        status: 'PAID',
        date: new Date()
      }
    });
    
    // Attempt delete
    await prisma.vendor.delete({ where: { id: vendor.id } });
    record('VENDOR-004', 'Vendors', 'Hard delete blocked if finance exists', false, 'Allowed hard delete of vendor with expenses');
  } catch(e) {
    record('VENDOR-004', 'Vendors', 'Hard delete blocked if finance exists', true, 'Blocked deletion via foreign key constraint');
  }

  // 18. Budget
  // BUDGET-004 - Budget Item With Expenses
  try {
    await prisma.budgetItem.delete({ where: { id: expense.budgetItemId } });
    record('BUDGET-004', 'Budget', 'Delete blocked if expenses exist', false, 'Allowed hard delete of budget item with expenses');
  } catch(e) {
    record('BUDGET-004', 'Budget', 'Delete blocked if expenses exist', true, 'Blocked deletion via foreign key constraint');
  }

  // 21. Calendar
  // CAL-001 - Create Event
  let calEvent;
  try {
    calEvent = await prisma.weddingEvent.create({
      data: { title: 'Test Event', eventDate: new Date(), startTime: '10:00', endTime: '12:00', sortOrder: 1 }
    });
    record('CAL-001', 'Calendar', 'Event Appears', true, 'Created event successfully');
  } catch(e) {
    record('CAL-001', 'Calendar', 'Event Appears', false, e.message);
  }

  console.log("\n=== SUMMARY ===");
  const passed = results.filter(r => r.pass).length;
  console.log(`Passed: ${passed}/${results.length}`);
}

runBackendTests().catch(console.error).finally(() => prisma.$disconnect());
