import { PrismaClient } from "@prisma/client";
import { PERMISSIONS } from "../src/lib/permissions";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding permissions...");

  for (const [key, value] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code: value },
      update: {},
      create: {
        code: value,
        description: `Permission to ${key.replace("_", " ").toLowerCase()}`
      }
    });
  }

  console.log("Permissions seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
