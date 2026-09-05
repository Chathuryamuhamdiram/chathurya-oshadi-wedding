// scripts/test-multi-event.js
// Integration test script for verifying multi-event context isolation and database integrity.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTests() {
  console.log("\n🧪 Running Multi-Event Automated Dev Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Fetch CeremonyEvents
    const weddingEvent = await prisma.ceremonyEvent.findFirst({ where: { eventType: "WEDDING" } });
    const homecomingEvent = await prisma.ceremonyEvent.findFirst({ where: { eventType: "HOMECOMING" } });

    assert(!!weddingEvent, "Wedding ceremony event exists in database");
    assert(!!homecomingEvent, "Homecoming ceremony event exists in database");

    if (!weddingEvent || !homecomingEvent) {
      console.error("Stopping tests due to missing event records.");
      return;
    }

    // Test 2: Verify existing BudgetItems are mapped to Wedding
    const budgetItemsCount = await prisma.budgetItem.count();
    const weddingBudgetItems = await prisma.budgetItem.count({ where: { eventId: weddingEvent.id } });
    assert(weddingBudgetItems === budgetItemsCount, `All ${budgetItemsCount} budget items are linked to Wedding event`);

    // Test 3: Create a test Budget Item in Homecoming event
    const category = await prisma.budgetCategory.findFirst();
    assert(!!category, "Budget category exists for test item creation");

    const hcBudgetItem = await prisma.budgetItem.create({
      data: {
        title: "Test Homecoming Music System",
        estimatedCost: 75000,
        categoryId: category.id,
        eventId: homecomingEvent.id,
        paymentStatus: "NOT_STARTED",
      },
    });
    assert(!!hcBudgetItem.id, "Successfully created budget item in Homecoming event");

    // Test 4: Verify isolation (Homecoming budget item must NOT appear in Wedding query)
    const weddingItems = await prisma.budgetItem.findMany({ where: { eventId: weddingEvent.id } });
    const hcItems = await prisma.budgetItem.findMany({ where: { eventId: homecomingEvent.id } });

    const existsInWedding = weddingItems.some((i) => i.id === hcBudgetItem.id);
    const existsInHC = hcItems.some((i) => i.id === hcBudgetItem.id);

    assert(!existsInWedding, "Homecoming budget item does NOT appear in Wedding context query");
    assert(existsInHC, "Homecoming budget item DOES appear in Homecoming context query");

    // Test 5: Verify Task isolation
    const hcTask = await prisma.task.create({
      data: {
        title: "Homecoming DJ Booking",
        category: "Entertainment",
        eventId: homecomingEvent.id,
        priority: "HIGH",
        status: "NOT_STARTED",
      },
    });
    assert(!!hcTask.id, "Successfully created task in Homecoming event");

    const weddingTasks = await prisma.task.findMany({ where: { eventId: weddingEvent.id } });
    const hcTasks = await prisma.task.findMany({ where: { eventId: homecomingEvent.id } });

    assert(!weddingTasks.some((t) => t.id === hcTask.id), "Homecoming task does NOT appear in Wedding context");
    assert(hcTasks.some((t) => t.id === hcTask.id), "Homecoming task DOES appear in Homecoming context");

    // Test 6: Verify Guest EventGuest mapping
    const guests = await prisma.guest.findMany({
      include: { eventGuests: true },
    });
    assert(guests.length > 0, `Guest records exist (${guests.length} guests found)`);
    const guestsWithWeddingLink = guests.filter((g) => g.eventGuests.some((eg) => eg.eventId === weddingEvent.id));
    assert(guestsWithWeddingLink.length === guests.length, "All existing guests are linked to Wedding event via EventGuest");

    // Cleanup test artifacts
    await prisma.budgetItem.delete({ where: { id: hcBudgetItem.id } });
    await prisma.task.delete({ where: { id: hcTask.id } });
    console.log("\n  🧹 Cleaned up temporary test data.");

    console.log(`\n🎉 Multi-Event Dev Testing Summary: ${passed} Passed, ${failed} Failed\n`);
  } catch (error) {
    console.error("❌ Error running multi-event dev tests:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
