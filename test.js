const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const events = await prisma.weddingEvent.findMany();
  console.log(JSON.stringify(events, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
