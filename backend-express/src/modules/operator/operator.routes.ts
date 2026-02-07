import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { listBookingsHandler, approveBookingHandler, rejectBookingHandler, listCarrierBookingsHandler } from './operator.controller.js';

const router = Router();

router.use(requireAuth, requireRole(['OPERATOR']));

router.get('/bookings', listBookingsHandler);
router.post('/bookings/:id/approve', approveBookingHandler);
router.post('/bookings/:id/reject', rejectBookingHandler);
router.get('/carriers/:carrierId/bookings', listCarrierBookingsHandler);

export default router;
