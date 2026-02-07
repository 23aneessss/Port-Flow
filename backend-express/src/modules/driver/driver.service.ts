import { prisma } from '../../config/db.js';
import { generateQrPayload } from '../../utils/qr.js';
import { isSameDate, minutesBefore } from '../../utils/time.js';
import { NotificationType } from '@prisma/client';
import { auditLog } from '../../utils/audit.js';

export async function listMyBookings(driverUserId: string) {
  return prisma.booking.findMany({ where: { driverUserId } });
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
