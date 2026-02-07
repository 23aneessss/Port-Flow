import { prisma } from '../config/db.js';
import type { Prisma, PrismaClient } from '@prisma/client';

type AuditDbClient = PrismaClient | Prisma.TransactionClient;

export async function auditLog(params: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
}, db: AuditDbClient = prisma) {
  await db.auditLog.create({
    data: {
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null
    }
  });
}
