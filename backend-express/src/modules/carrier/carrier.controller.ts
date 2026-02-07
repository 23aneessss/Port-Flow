import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.js';
import {
  registerCarrier,
  createDriver,
  listDrivers,
  updateDriver,
  deleteDriver,
  listDriverTrips,
  createBooking,
  listBookings,
  updateBooking,
  deleteBooking
} from './carrier.service.js';

export async function registerCarrierHandler(req: AuthRequest, res: Response) {
  const result = await registerCarrier({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    gender: req.body.gender,
    birthDate: new Date(req.body.birthDate),
    companyName: req.body.companyName,
    proofDocumentUrl: req.body.proofDocumentUrl
  });

  return res.status(201).json(result);
}

export async function createDriverHandler(req: AuthRequest, res: Response) {
  try {
    const result = await createDriver(req.user!.id, {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      gender: req.body.gender,
      birthDate: new Date(req.body.birthDate),
      truckNumber: req.body.truckNumber,
      truckPlate: req.body.truckPlate,
      drivingLicenseUrl: req.body.drivingLicenseUrl
    });
    return res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function listDriversHandler(req: AuthRequest, res: Response) {
  const drivers = await listDrivers(req.user!.id);
  return res.json(drivers);
}

export async function updateDriverHandler(req: AuthRequest, res: Response) {
  try {
    const driver = await updateDriver(req.user!.id, req.params.id, req.body);
    return res.json(driver);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function deleteDriverHandler(req: AuthRequest, res: Response) {
  try {
    const result = await deleteDriver(req.user!.id, req.params.id);
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function listDriverTripsHandler(req: AuthRequest, res: Response) {
  try {
    const trips = await listDriverTrips(req.user!.id, req.params.id);
    return res.json(trips);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function createBookingHandler(req: AuthRequest, res: Response) {
  try {
    const booking = await createBooking(req.user!.id, {
      terminalId: req.body.terminalId,
      date: new Date(req.body.date),
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
      driverUserId: req.body.driverUserId
    });
    return res.status(201).json(booking);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function listBookingsHandler(req: AuthRequest, res: Response) {
  const bookings = await listBookings(req.user!.id);
  return res.json(bookings);
}

export async function updateBookingHandler(req: AuthRequest, res: Response) {
  try {
    const booking = await updateBooking(req.user!.id, req.params.id, req.body);
    return res.json(booking);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}

export async function deleteBookingHandler(req: AuthRequest, res: Response) {
  try {
    const result = await deleteBooking(req.user!.id, req.params.id);
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return res.status(400).json({ message });
  }
}
