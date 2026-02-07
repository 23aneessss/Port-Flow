import { PrismaClient, Role, TerminalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@port.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        isActive: true
      }
    });
  }

  const terminalExists = await prisma.terminal.findFirst();
  if (!terminalExists) {
    await prisma.terminal.create({
      data: {
        name: 'Terminal Demo',
        status: TerminalStatus.ACTIVE,
        maxSlots: 10,
        availableSlots: 10,
        coordX: 0,
        coordY: 0
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
