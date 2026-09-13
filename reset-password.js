const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'chathuryamuhamdiram@gmail.com';
    const newPassword = 'password123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Update the user
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    
    console.log(`Successfully reset password for ${email} to: ${newPassword}`);
  } catch (error) {
    console.error('Failed to reset password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
