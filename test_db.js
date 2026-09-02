const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.klprhtigicpairvocpjc:Chathurya17%23@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
    }
  }
});

async function main() {
  try {
    console.log("Connecting to Supabase on port 6543...");
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Success! Found users:", users.length);
  } catch (e) {
    console.error("Error connecting to Supabase on 6543:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
