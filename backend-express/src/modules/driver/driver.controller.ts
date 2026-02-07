import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.js';
import { listMyBookings, getBookingQr, listNotifications, markNotificationRead } from './driver.service.js';

export async function listMyBookingsHandler(req: AuthRequest, res: Response) {
  const bookings = await listMyBookings(req.user!.id);
  return res.json(bookings);
}

export async function getBookingQrHandler(req: AuthRequest, res: Response) {
  try {
    const payload = await getBookingQr(req.user!.id, req.params.id);
    return res.json({ qr_payload: payload });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function listNotificationsHandler(req: AuthRequest, res: Response) {
  const notifs = await listNotifications(req.user!.id);
  return res.json(notifs);
}

export async function markNotificationReadHandler(req: AuthRequest, res: Response) {
  try {
    const notif = await markNotificationRead(req.user!.id, req.params.id);
    return res.json(notif);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}
