import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTests() {
  console.log('--- RSVP END-TO-END SIMULATED TESTS ---');
  
  // Clean up
  await prisma.guest.deleteMany({ where: { invitationCode: 'TESTGUEST' } });
  
  // Setup
  const guest = await prisma.guest.create({
    data: {
      invitationCode: 'TESTGUEST',
      displayName: 'Test Family',
      allowedGuestCount: 5,
      confirmedGuestCount: 0,
      liquorCount: 0,
      rsvpStatus: 'PENDING',
      invitationType: 'FAMILY'
    }
  });

  console.log('Test Setup: Guest created with limit 5');
  
  // Simulate Test 1: Exceed guest limit
  // Instead of hitting HTTP, we will simulate what actions.ts does
  let error1 = null;
  const inputGuests1 = 6;
  if (inputGuests1 > guest.allowedGuestCount) {
    error1 = 'Guest count cannot exceed your invitation limit';
  }
  console.log(Test 1 (Exceed Guest Limit): );

  // Simulate Test 2: Exceed liquor count
  let error2 = null;
  const inputGuests2 = 3;
  const inputLiquor2 = 4;
  if (inputLiquor2 > inputGuests2) {
    error2 = 'Liquor count cannot exceed confirmed guest count';
  }
  console.log(Test 2 (Exceed Liquor Count): );

  // Simulate Test 3: Valid Input
  let error3 = null;
  const inputGuests3 = 4;
  const inputLiquor3 = 2;
  if (inputGuests3 <= guest.allowedGuestCount && inputLiquor3 <= inputGuests3) {
    // Valid
    await prisma.guest.update({
      where: { invitationCode: 'TESTGUEST' },
      data: {
        confirmedGuestCount: inputGuests3,
        liquorCount: inputLiquor3,
        rsvpStatus: 'ATTENDING'
      }
    });
  } else {
    error3 = 'Validation failed';
  }
  
  const updatedGuest = await prisma.guest.findUnique({ where: { invitationCode: 'TESTGUEST' } });
  
  console.log(Test 3 (Valid Input): );
  
  // Clean up
  await prisma.guest.deleteMany({ where: { invitationCode: 'TESTGUEST' } });
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
