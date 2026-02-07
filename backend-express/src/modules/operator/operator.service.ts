import { prisma } from '../../config/db.js';
import { auditLog } from '../../utils/audit.js';
import { NotificationType } from '@prisma/client';

async function hasOperatorProfile(userId: string) {
  const profile = await prisma.operatorProfile.findUnique({ where: { userId } });
  return !!profile;
}

export async function listBookingsForOperator(userId: string, status?: string) {
  if (!(await hasOperatorProfile(userId))) return [];
  return prisma.booking.findMany({
    where: {
      status: status as any
    },
    include: { carrier: true, driver: true }
  });
}

export async function approveBooking(operatorUserId: string, bookingId: string) {
  const profile = await prisma.operatorProfile.findUnique({ where: { userId: operatorUserId } });
  if (!profile) throw new Error('Operator profile not found');

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'PENDING') throw new Error('Booking not pending');

    const terminal = await tx.terminal.findUnique({ where: { id: booking.terminalId } });
    if (!terminal || terminal.availableSlots <= 0) throw new Error('No available slots');

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        decidedByOperatorUserId: operatorUserId
      }
    });

    await tx.terminal.update({
      where: { id: booking.terminalId },
      data: { availableSlots: terminal.availableSlots - 1 }
    });

    if (updatedBooking.driverUserId) {
      await tx.notification.create({
        data: {
          userId: updatedBooking.driverUserId,
          type: NotificationType.BOOKING_CONFIRMED,
          message: `Trajet confirme pour ${updatedBooking.startTime.toISOString()}`,
          relatedBookingId: updatedBooking.id
        }
      });
    }

    await auditLog({
      actorUserId: operatorUserId,
      action: 'APPROVE_BOOKING',
      entityType: 'Booking',
      entityId: updatedBooking.id
    }, tx);

    return updatedBooking;
  });
}

export async function rejectBooking(operatorUserId: string, bookingId: string) {
  const profile = await prisma.operatorProfile.findUnique({ where: { userId: operatorUserId } });
  if (!profile) throw new Error('Operator profile not found');

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error('Booking not found');

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'REJECTED', decidedByOperatorUserId: operatorUserId }
  });

  await auditLog({
    actorUserId: operatorUserId,
    action: 'REJECT_BOOKING',
    entityType: 'Booking',
    entityId: updated.id
  });

  return updated;
}

export async function listCarrierBookingsForOperator(operatorUserId: string, carrierId: string) {
  if (!(await hasOperatorProfile(operatorUserId))) return [];
  return prisma.booking.findMany({
    where: {
      carrierUserId: carrierId
    }
  });
}

export async function listTerminalsForOperator(operatorUserId: string) {
  if (!(await hasOperatorProfile(operatorUserId))) return [];
  return prisma.terminal.findMany();
}

export async function getTerminalForOperator(operatorUserId: string, terminalId: string) {
  if (!(await hasOperatorProfile(operatorUserId))) return null;
  return prisma.terminal.findUnique({ where: { id: terminalId } });
}

export async function dashboardOverviewForOperator(operatorUserId: string) {
  if (!(await hasOperatorProfile(operatorUserId))) {
    return {
      totalBookings: 0,
      pendingBookings: 0,
      carriersPending: 0,
      totalTerminals: 0,
      totalCarriers: 0,
      totalDrivers: 0
    };
  }

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
