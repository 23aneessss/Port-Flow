import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.js';
import { approveBooking, listBookingsForOperator, rejectBooking, listCarrierBookingsForOperator } from './operator.service.js';

export async function listBookingsHandler(req: AuthRequest, res: Response) {
  const status = req.query.status as string | undefined;
  const bookings = await listBookingsForOperator(req.user!.id, status);
  return res.json(bookings);
}

export async function approveBookingHandler(req: AuthRequest, res: Response) {
  try {
    const booking = await approveBooking(req.user!.id, req.params.id);
    return res.json(booking);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    if (message === 'Booking not found') return res.status(404).json({ message });
    if (message === 'Forbidden') return res.status(403).json({ message });
    return res.status(400).json({ message });
  }
}

export async function rejectBookingHandler(req: AuthRequest, res: Response) {
  try {
    const booking = await rejectBooking(req.user!.id, req.params.id);
    return res.json(booking);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    if (message === 'Booking not found') return res.status(404).json({ message });
    if (message === 'Forbidden') return res.status(403).json({ message });
    return res.status(400).json({ message });
  }
}

export async function listCarrierBookingsHandler(req: AuthRequest, res: Response) {
  const bookings = await listCarrierBookingsForOperator(req.user!.id, req.params.carrierId);
  return res.json(bookings);
}
