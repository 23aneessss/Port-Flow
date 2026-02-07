import { prisma } from '../../config/db.js';

export async function listAnomalies(role: 'ADMIN' | 'OPERATOR', userId: string) {
  if (role === 'ADMIN') {
    return prisma.anomaly.findMany({ include: { terminal: true, booking: true } });
  }

  return prisma.anomaly.findMany({
    include: { terminal: true, booking: true }
  });
}
