import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "admin@wedding.com";
  const password = "AdminPassword123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "SUPER_ADMIN" },
    create: {
      fullName: "Wedding Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Admin account created successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
