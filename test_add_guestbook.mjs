import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.guestbookEntry.create({
    data: {
      name: "Antigravity Assistant",
      message: "This is a test message to verify the guestbook management page works correctly! You can try toggling my visibility or deleting me.",
      isPublic: false
    }
  });
  console.log("Test guestbook entry added successfully!");
}

main().finally(() => prisma.$disconnect());
