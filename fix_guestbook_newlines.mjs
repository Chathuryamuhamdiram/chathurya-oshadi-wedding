import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entries = await prisma.guestbookEntry.findMany();
  for (const entry of entries) {
    if (entry.message.includes("\n\n— Memory:")) {
      const newMessage = entry.message.replace("\n\n— Memory:", "\n— Memory:");
      await prisma.guestbookEntry.update({
        where: { id: entry.id },
        data: { message: newMessage }
      });
      console.log(`Updated entry ${entry.id}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
