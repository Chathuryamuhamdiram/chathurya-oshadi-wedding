import { prisma } from "../src/lib/db";

async function main() {
  const guests = await prisma.guest.findMany({
    select: { invitationCode: true, displayName: true, invitationType: true, allowedGuestCount: true }
  });
  guests.forEach(g =>
    console.log(`${g.displayName} | ${g.invitationType} (${g.allowedGuestCount} guests) => http://localhost:3000/invite/${g.invitationCode}`)
  );
  await prisma.$disconnect();
}

main();
