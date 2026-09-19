const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const menuId = '9bb2bc16-9993-40ca-a75c-575b7531927d';
  const menu = await prisma.foodMenu.findUnique({
    where: { id: menuId },
    include: {
      sections: {
        include: {
          items: true
        }
      }
    }
  });

  if (!menu) {
    console.log("Menu not found");
    return;
  }

  for (const section of menu.sections) {
    for (const item of section.items) {
      if (item.name.includes("Sanquick")) {
        console.log("Found item:", item.name);
        const chars = Array.from(item.name);
        const cps = chars.map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')} (${c})`);
        console.log(cps.join('\n'));
      }
    }
  }
}
main().finally(() => prisma.$disconnect());
