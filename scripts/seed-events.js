// scripts/seed-events.js
// Seeds Wedding + Homecoming ceremony events and migrates existing data.
// Safe to run multiple times (idempotent).

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("\n🌱 Seeding ceremony events...\n");

  // 1. Upsert Wedding event
  let wedding = await prisma.ceremonyEvent.findFirst({
    where: { eventType: "WEDDING" },
  });

  if (!wedding) {
    wedding = await prisma.ceremonyEvent.create({
      data: {
        name: "Wedding",
        eventType: "WEDDING",
        status: "PLANNING",
        isActive: true,
        description: "The main wedding ceremony and reception.",
      },
    });
    console.log(`  ✅ Created Wedding event: ${wedding.id}`);
  } else {
    console.log(`  ℹ️  Wedding event already exists: ${wedding.id}`);
  }

  // 2. Upsert Homecoming event
  let homecoming = await prisma.ceremonyEvent.findFirst({
    where: { eventType: "HOMECOMING" },
  });

  if (!homecoming) {
    homecoming = await prisma.ceremonyEvent.create({
      data: {
        name: "Homecoming",
        eventType: "HOMECOMING",
        status: "PLANNING",
        isActive: true,
        description: "The homecoming celebration.",
      },
    });
    console.log(`  ✅ Created Homecoming event: ${homecoming.id}`);
  } else {
    console.log(`  ℹ️  Homecoming event already exists: ${homecoming.id}`);
  }

  // 3. Migrate existing BudgetItems without eventId → assign to Wedding
  const unlinkedBudgetItems = await prisma.budgetItem.findMany({
    where: { eventId: null },
    select: { id: true },
  });
  if (unlinkedBudgetItems.length > 0) {
    await prisma.budgetItem.updateMany({
      where: { eventId: null },
      data: { eventId: wedding.id },
    });
    console.log(`  ✅ Migrated ${unlinkedBudgetItems.length} BudgetItems → Wedding`);
  } else {
    console.log(`  ℹ️  No unlinked BudgetItems to migrate`);
  }

  // 4. Migrate existing Tasks without eventId → assign to Wedding
  const unlinkedTasks = await prisma.task.findMany({
    where: { eventId: null },
    select: { id: true },
  });
  if (unlinkedTasks.length > 0) {
    await prisma.task.updateMany({
      where: { eventId: null },
      data: { eventId: wedding.id },
    });
    console.log(`  ✅ Migrated ${unlinkedTasks.length} Tasks → Wedding`);
  } else {
    console.log(`  ℹ️  No unlinked Tasks to migrate`);
  }

  // 5. Migrate existing Contributions without eventId → assign to Wedding
  const unlinkedContributions = await prisma.contribution.findMany({
    where: { eventId: null },
    select: { id: true },
  });
  if (unlinkedContributions.length > 0) {
    await prisma.contribution.updateMany({
      where: { eventId: null },
      data: { eventId: wedding.id },
    });
    console.log(`  ✅ Migrated ${unlinkedContributions.length} Contributions → Wedding`);
  } else {
    console.log(`  ℹ️  No unlinked Contributions to migrate`);
  }

  // 6. Create EventGuest records for all existing Guests → link to Wedding
  const guests = await prisma.guest.findMany({ select: { id: true } });
  let createdEventGuests = 0;
  for (const guest of guests) {
    const existing = await prisma.eventGuest.findUnique({
      where: { guestId_eventId: { guestId: guest.id, eventId: wedding.id } },
    });
    if (!existing) {
      await prisma.eventGuest.create({
        data: {
          guestId: guest.id,
          eventId: wedding.id,
        },
      });
      createdEventGuests++;
    }
  }
  console.log(`  ✅ Created ${createdEventGuests} EventGuest links (${guests.length - createdEventGuests} already existed)`);

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Wedding event ID:    ${wedding.id}`);
  console.log(`   Homecoming event ID: ${homecoming.id}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
