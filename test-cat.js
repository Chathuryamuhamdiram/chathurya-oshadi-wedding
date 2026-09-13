const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.budgetCategory.create({
    data: { name: "Test Server Action Category" }
  });
  console.log("Created category:", cat);
}

main().catch(console.error).finally(() => prisma.$disconnect());
