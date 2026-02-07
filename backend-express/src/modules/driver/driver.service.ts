import { prisma } from '../../config/db.js';
import { generateQrPayload } from '../../utils/qr.js';
import { isSameDate, minutesBefore } from '../../utils/time.js';
import { BookingStatus, NotificationType } from '@prisma/client';
import { auditLog } from '../../utils/audit.js';

const bookingInclude = {
  terminal: {
    select: {
      id: true,
      name: true
    }
  },
  carrier: {
    select: {
      id: true,
      carrierProfile: {
        select: {
          companyName: true
        }
      }
    }
  },
  driver: {
    select: {
      id: true,
      email: true,
      driverProfile: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          truckNumber: true,
          truckPlate: true
        }
      }
    }
  }
} as const;

export async function listMyBookings(driverUserId: string) {
  return prisma.booking.findMany({
    where: { driverUserId },
    include: bookingInclude,
    orderBy: { startTime: 'asc' }
  });
}

export async function listMyHistory(driverUserId: string) {
  return prisma.booking.findMany({
    where: {
      driverUserId,
      status: BookingStatus.CONSUMED
    },
    include: bookingInclude,
    orderBy: { startTime: 'desc' }
  });
}

export async function getMyProfile(driverUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: driverUserId },
    include: {
      driverProfile: {
        include: {
          carrier: {
            select: {
              id: true,
              carrierProfile: {
                select: {
                  companyName: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user || !user.driverProfile) throw new Error('Driver profile not found');

  const profile = user.driverProfile;
  return {
    id: user.id,
    email: user.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    transporterId: profile.carrierUserId,
    transporterName: profile.carrier.carrierProfile?.companyName ?? 'Transporteur',
    truckNumber: profile.truckNumber,
    truckPlate: profile.truckPlate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function getBookingQr(driverUserId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.driverUserId !== driverUserId) throw new Error('Booking not found');
  if (booking.status !== 'CONFIRMED') throw new Error('Booking not confirmed');

  const now = new Date();
  const allowedAt = minutesBefore(booking.startTime, 15);
  if (!isSameDate(now, booking.startTime) || now < allowedAt) {
    throw new Error('QR not available yet');
  }

  if (!booking.qrPayload) {
    const payload = generateQrPayload(booking.id);
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { qrPayload: payload }
    });
    await prisma.notification.create({
      data: {
        userId: driverUserId,
        type: NotificationType.QR_READY,
        message: 'Votre QR est disponible',
        relatedBookingId: booking.id
      }
    });
    await auditLog({ actorUserId: driverUserId, action: 'GENERATE_QR', entityType: 'Booking', entityId: booking.id });
    return updated.qrPayload;
  }

  return booking.qrPayload;
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.userId !== userId) throw new Error('Notification not found');
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}
