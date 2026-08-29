import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function setup() {
  const code = 'TESTGUEST'
  await prisma.guest.upsert({
    where: { invitationCode: code },
    update: { allowedGuestCount: 5, confirmedGuestCount: 0, liquorCount: 0, rsvpStatus: 'PENDING' },
    create: { invitationCode: code, displayName: 'Test Family', allowedGuestCount: 5 }
  })
  console.log('Setup complete')
}

setup().catch(console.error).finally(() => prisma.$disconnect())
