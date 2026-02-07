import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';
import { listMyBookingsHandler, getBookingQrHandler, listNotificationsHandler, markNotificationReadHandler } from './driver.controller.js';

const router = Router();

router.use(requireAuth, requireRole(['DRIVER']));

router.get('/bookings/mine', listMyBookingsHandler);
router.get('/bookings/:id/qr', getBookingQrHandler);
router.get('/notifications', listNotificationsHandler);
router.post('/notifications/:id/read', markNotificationReadHandler);

export default router;
