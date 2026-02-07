import { prisma } from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { CarrierStatus, Role, TerminalStatus } from '@prisma/client';
import { auditLog } from '../../utils/audit.js';

export async function createOperator(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: Date;
}, actorUserId: string) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: Role.OPERATOR,
        isActive: true
      }
    });
    const profile = await tx.operatorProfile.create({
      data: {
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        gender: input.gender,
        birthDate: input.birthDate
      }
    });
    await auditLog({
      actorUserId,
      action: 'CREATE_OPERATOR',
      entityType: 'User',
      entityId: user.id
    }, tx);
    return { user, profile };
  });
}

export async function getOperator(operatorUserId: string) {
  return prisma.operatorProfile.findUnique({
    where: { userId: operatorUserId },
    include: { user: true }
  });
}

export async function updateOperator(
  operatorUserId: string,
  data: Partial<{
    email: string;
    password: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    birthDate: Date;
  }>,
  actorUserId: string
) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.operatorProfile.findUnique({ where: { userId: operatorUserId } });
    if (!profile) throw new Error('Operator not found');

    if (data.email || data.password || typeof data.isActive === 'boolean') {
      const userUpdate: { email?: string; passwordHash?: string; isActive?: boolean } = {};
      if (data.email) userUpdate.email = data.email;
      if (typeof data.isActive === 'boolean') userUpdate.isActive = data.isActive;
      if (data.password) userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
      await tx.user.update({ where: { id: operatorUserId }, data: userUpdate });
    }

    const profileUpdate: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      gender: string;
      birthDate: Date;
    }> = {};
    if (data.firstName) profileUpdate.firstName = data.firstName;
    if (data.lastName) profileUpdate.lastName = data.lastName;
    if (data.phone) profileUpdate.phone = data.phone;
    if (data.gender) profileUpdate.gender = data.gender;
    if (data.birthDate) profileUpdate.birthDate = data.birthDate;

    if (Object.keys(profileUpdate).length > 0) {
      await tx.operatorProfile.update({ where: { userId: operatorUserId }, data: profileUpdate });
    }

    await auditLog({
      actorUserId,
      action: 'UPDATE_OPERATOR',
      entityType: 'User',
      entityId: operatorUserId
    }, tx);

    return tx.operatorProfile.findUnique({
      where: { userId: operatorUserId },
      include: { user: true }
    });
  });
}

export async function deleteOperator(operatorUserId: string, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: operatorUserId } });
    if (!user || user.role !== Role.OPERATOR) throw new Error('Operator not found');

    const updated = await tx.user.update({
      where: { id: operatorUserId },
      data: { isActive: false }
    });

    await auditLog({
      actorUserId,
      action: 'DELETE_OPERATOR',
      entityType: 'User',
      entityId: operatorUserId
    }, tx);

    return updated;
  });
}

export async function createTerminal(data: {
  name: string;
  status?: TerminalStatus;
  maxSlots: number;
  availableSlots: number;
  coordX: number;
  coordY: number;
}, actorUserId: string) {
  const terminal = await prisma.terminal.create({ data });
  await auditLog({ actorUserId, action: 'CREATE_TERMINAL', entityType: 'Terminal', entityId: terminal.id });
  return terminal;
}

export async function listTerminals() {
  return prisma.terminal.findMany();
}

export async function getTerminal(id: string) {
  return prisma.terminal.findUnique({ where: { id } });
}

export async function updateTerminal(id: string, data: Partial<{ name: string; status: TerminalStatus; maxSlots: number; availableSlots: number; coordX: number; coordY: number; }>, actorUserId: string) {
  const terminal = await prisma.terminal.update({ where: { id }, data });
  await auditLog({ actorUserId, action: 'UPDATE_TERMINAL', entityType: 'Terminal', entityId: terminal.id });
  return terminal;
}

export async function deleteTerminal(id: string, actorUserId: string) {
  const terminal = await prisma.terminal.delete({ where: { id } });
  await auditLog({ actorUserId, action: 'DELETE_TERMINAL', entityType: 'Terminal', entityId: terminal.id });
  return terminal;
}

export async function listCarriers(status?: CarrierStatus) {
  return prisma.carrierProfile.findMany({
    where: status ? { status } : undefined,
    include: { user: true }
  });
}

export async function updateCarrier(
  carrierUserId: string,
  data: Partial<{
    email: string;
    password: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    birthDate: Date;
    companyName: string;
    status: CarrierStatus;
    proofDocumentUrl: string;
  }>,
  actorUserId: string
) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.carrierProfile.findUnique({ where: { userId: carrierUserId } });
    if (!profile) throw new Error('Carrier not found');

    if (data.email || data.password || typeof data.isActive === 'boolean') {
      const userUpdate: { email?: string; passwordHash?: string; isActive?: boolean } = {};
      if (data.email) userUpdate.email = data.email;
      if (typeof data.isActive === 'boolean') userUpdate.isActive = data.isActive;
      if (data.password) userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
      await tx.user.update({ where: { id: carrierUserId }, data: userUpdate });
    }

    const profileUpdate: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      gender: string;
      birthDate: Date;
      companyName: string;
      status: CarrierStatus;
      proofDocumentUrl: string;
    }> = {};
    if (data.firstName) profileUpdate.firstName = data.firstName;
    if (data.lastName) profileUpdate.lastName = data.lastName;
    if (data.phone) profileUpdate.phone = data.phone;
    if (data.gender) profileUpdate.gender = data.gender;
    if (data.birthDate) profileUpdate.birthDate = data.birthDate;
    if (data.companyName) profileUpdate.companyName = data.companyName;
    if (data.status) profileUpdate.status = data.status;
    if (data.proofDocumentUrl) profileUpdate.proofDocumentUrl = data.proofDocumentUrl;

    if (Object.keys(profileUpdate).length > 0) {
      await tx.carrierProfile.update({ where: { userId: carrierUserId }, data: profileUpdate });
    }

    await auditLog({
      actorUserId,
      action: 'UPDATE_CARRIER',
      entityType: 'CarrierProfile',
      entityId: carrierUserId
    }, tx);

    return tx.carrierProfile.findUnique({
      where: { userId: carrierUserId },
      include: { user: true }
    });
  });
}

export async function approveCarrier(carrierUserId: string, actorUserId: string) {
  const carrier = await prisma.carrierProfile.update({
    where: { userId: carrierUserId },
    data: { status: CarrierStatus.APPROVED }
  });
  await auditLog({ actorUserId, action: 'APPROVE_CARRIER', entityType: 'CarrierProfile', entityId: carrier.userId });
  return carrier;
}

export async function rejectCarrier(carrierUserId: string, actorUserId: string) {
  const carrier = await prisma.carrierProfile.update({
    where: { userId: carrierUserId },
    data: { status: CarrierStatus.REJECTED }
  });
  await auditLog({ actorUserId, action: 'REJECT_CARRIER', entityType: 'CarrierProfile', entityId: carrier.userId });
  return carrier;
}

export async function listCarrierDrivers(carrierUserId: string) {
  return prisma.driverProfile.findMany({ where: { carrierUserId }, include: { user: true } });
}

export async function dashboardOverview() {
  const [
    totalBookings,
    pendingBookings,
    carriersPending,
    totalTerminals,
    totalCarriers,
    totalDrivers
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.carrierProfile.count({ where: { status: 'PENDING' } }),
    prisma.terminal.count(),
    prisma.carrierProfile.count(),
    prisma.driverProfile.count()
  ]);

  return {
    totalBookings,
    pendingBookings,
    carriersPending,
    totalTerminals,
    totalCarriers,
    totalDrivers
  };
}
