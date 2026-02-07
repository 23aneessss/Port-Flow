import { prisma } from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { CarrierStatus, Role } from '@prisma/client';
import { auditLog } from '../../utils/audit.js';

export async function registerCarrier(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: Date;
  companyName: string;
  proofDocumentUrl: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: Role.CARRIER,
        isActive: true
      }
    });
    const profile = await tx.carrierProfile.create({
      data: {
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        gender: input.gender,
        birthDate: input.birthDate,
        companyName: input.companyName,
        status: CarrierStatus.PENDING,
        proofDocumentUrl: input.proofDocumentUrl
      }
    });
    await auditLog({ actorUserId: user.id, action: 'REGISTER_CARRIER', entityType: 'CarrierProfile', entityId: profile.userId }, tx);
    return { user, profile };
  });
}

async function ensureCarrierApproved(carrierUserId: string) {
  const carrier = await prisma.carrierProfile.findUnique({ where: { userId: carrierUserId } });
  if (!carrier) throw new Error('Carrier not found');
  if (carrier.status !== CarrierStatus.APPROVED) throw new Error('Carrier not approved');
}

export async function createDriver(carrierUserId: string, input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthDate: Date;
  truckNumber: string;
  truckPlate: string;
  drivingLicenseUrl: string;
}) {
  await ensureCarrierApproved(carrierUserId);
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: Role.DRIVER,
        isActive: true
      }
    });
    const profile = await tx.driverProfile.create({
      data: {
        userId: user.id,
        carrierUserId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        gender: input.gender,
        birthDate: input.birthDate,
        truckNumber: input.truckNumber,
        truckPlate: input.truckPlate,
        drivingLicenseUrl: input.drivingLicenseUrl,
        status: 'ACTIVE'
      }
    });
    await auditLog({ actorUserId: carrierUserId, action: 'CREATE_DRIVER', entityType: 'DriverProfile', entityId: profile.userId }, tx);
    return { user, profile };
  });
}

export async function listDrivers(carrierUserId: string) {
  return prisma.driverProfile.findMany({ where: { carrierUserId }, include: { user: true } });
}

export async function updateDriver(carrierUserId: string, driverUserId: string, data: any) {
  await ensureCarrierApproved(carrierUserId);
  const driver = await prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
  if (!driver || driver.carrierUserId !== carrierUserId) throw new Error('Driver not found');
  const updated = await prisma.driverProfile.update({ where: { userId: driverUserId }, data });
  await auditLog({ actorUserId: carrierUserId, action: 'UPDATE_DRIVER', entityType: 'DriverProfile', entityId: driverUserId });
  return updated;
}

export async function deleteDriver(carrierUserId: string, driverUserId: string) {
  await ensureCarrierApproved(carrierUserId);
  const driver = await prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
  if (!driver || driver.carrierUserId !== carrierUserId) throw new Error('Driver not found');
  await prisma.driverProfile.delete({ where: { userId: driverUserId } });
  await prisma.user.delete({ where: { id: driverUserId } });
  await auditLog({ actorUserId: carrierUserId, action: 'DELETE_DRIVER', entityType: 'DriverProfile', entityId: driverUserId });
  return { deleted: true };
}

export async function listDriverTrips(carrierUserId: string, driverUserId: string) {
  const driver = await prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
  if (!driver || driver.carrierUserId !== carrierUserId) throw new Error('Driver not found');
  return prisma.booking.findMany({ where: { driverUserId } });
}

export async function createBooking(carrierUserId: string, data: {
  terminalId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  driverUserId?: string | null;
}) {
  await ensureCarrierApproved(carrierUserId);
  const booking = await prisma.booking.create({
    data: {
      carrierUserId,
      terminalId: data.terminalId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      driverUserId: data.driverUserId ?? null,
      status: 'PENDING'
    }
  });
  await auditLog({ actorUserId: carrierUserId, action: 'CREATE_BOOKING', entityType: 'Booking', entityId: booking.id });
  return booking;
}

export async function listBookings(carrierUserId: string) {
  return prisma.booking.findMany({ where: { carrierUserId } });
}

export async function updateBooking(carrierUserId: string, bookingId: string, data: any) {
  await ensureCarrierApproved(carrierUserId);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.carrierUserId !== carrierUserId) throw new Error('Booking not found');
  if (booking.status !== 'PENDING') throw new Error('Booking not pending');
  const updated = await prisma.booking.update({ where: { id: bookingId }, data });
  await auditLog({ actorUserId: carrierUserId, action: 'UPDATE_BOOKING', entityType: 'Booking', entityId: bookingId });
  return updated;
}

export async function deleteBooking(carrierUserId: string, bookingId: string) {
  await ensureCarrierApproved(carrierUserId);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.carrierUserId !== carrierUserId) throw new Error('Booking not found');
  if (booking.status !== 'PENDING') throw new Error('Booking not pending');
  await prisma.booking.delete({ where: { id: bookingId } });
  await auditLog({ actorUserId: carrierUserId, action: 'DELETE_BOOKING', entityType: 'Booking', entityId: bookingId });
  return { deleted: true };
}
