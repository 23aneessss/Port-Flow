import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import {
  registerCarrierHandler,
  createDriverHandler,
  listDriversHandler,
  updateDriverHandler,
  deleteDriverHandler,
  listDriverTripsHandler,
  createBookingHandler,
  listBookingsHandler,
  listTerminalsForCarrierHandler,
  updateBookingHandler,
  deleteBookingHandler
} from './carrier.controller.js';

const router = Router();

const carrierRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  gender: z.string().min(1),
  birthDate: z.string(),
  companyName: z.string().min(1),
  proofDocumentUrl: z.string().min(3)
});

const driverSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  gender: z.string().min(1),
  birthDate: z.string(),
  truckNumber: z.string().min(1),
  truckPlate: z.string().min(1),
  drivingLicenseUrl: z.string().min(3)
});

const bookingSchema = z.object({
  terminalId: z.string().uuid(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  driverUserId: z.string().uuid().optional()
});

router.post('/register', (req, res, next) => {
  try {
    carrierRegisterSchema.parse(req.body);
    return registerCarrierHandler(req as any, res);
  } catch (err) {
    return next(err);
  }
});

router.use(requireAuth, requireRole(['CARRIER']));

router.post('/drivers', (req, res, next) => {
  try {
    driverSchema.parse(req.body);
    return createDriverHandler(req as any, res);
  } catch (err) {
    return next(err);
  }
});

router.get('/drivers', listDriversHandler);
router.put('/drivers/:id', updateDriverHandler);
router.delete('/drivers/:id', deleteDriverHandler);
router.get('/drivers/:id/trips', listDriverTripsHandler);

router.get('/terminals', listTerminalsForCarrierHandler);

router.post('/bookings', (req, res, next) => {
  try {
    bookingSchema.parse(req.body);
    return createBookingHandler(req as any, res);
  } catch (err) {
    return next(err);
  }
});

router.get('/bookings', listBookingsHandler);
router.put('/bookings/:id', updateBookingHandler);
router.delete('/bookings/:id', deleteBookingHandler);

export default router;
